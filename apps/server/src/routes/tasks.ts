import { Router } from "express";
import type { FileArray, UploadedFile } from "express-fileupload";
import { randomUUID } from "node:crypto";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { createTaskServerSchema, taskStatusSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { buildShortDescription, serializeTask } from "../lib/serialization.js";
import { requireSessionAdminOrProjectAccess, requireSessionAdminOrTaskProjectAccess } from "../middleware/projectAccess.js";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
    images: true;
  };
}>;

export const tasksRouter = Router();

const taskPhotoFieldNames = ["photos", "photos[]"];
const maxTaskPhotoCount = 10;
const maxTaskPhotoSize = 5 * 1024 * 1024;
const taskUploadsRoot = path.resolve(process.cwd(), "uploads", "tasks");

// express-fileupload возвращает один файл или массив для одного поля.
function normalizeUploadedFiles(fileField: UploadedFile | UploadedFile[] | undefined) {
  if (!fileField) {
    return [];
  }

  return Array.isArray(fileField) ? fileField : [fileField];
}

// Принимаем оба частых имени multipart-поля от разных клиентов.
function getTaskPhotoFiles(files: FileArray | null | undefined) {
  if (!files) {
    return [];
  }

  return taskPhotoFieldNames.flatMap((fieldName) => normalizeUploadedFiles(files[fieldName]));
}

// Здесь только проверяем файлы, сохранение добавим вместе с БД/хранилищем.
function validateTaskPhotoFiles(files: UploadedFile[]) {
  if (files.length > maxTaskPhotoCount) {
    return `Можно загрузить не больше ${maxTaskPhotoCount} фото.`;
  }

  const invalidTypeFile = files.find((file) => !file.mimetype.startsWith("image/"));

  if (invalidTypeFile) {
    return "Можно загружать только изображения.";
  }

  const oversizedFile = files.find((file) => file.size > maxTaskPhotoSize);

  if (oversizedFile) {
    return "Размер одного фото не должен превышать 5 МБ.";
  }

  return null;
}

// Генерируем имя без пользовательского пути, оставляя только расширение.
function buildTaskPhotoFileName(file: UploadedFile) {
  const extension = path.extname(file.name).toLowerCase();

  return `${randomUUID()}${extension}`;
}

// Складываем фото в папку задачи, пока без записи путей в БД.
async function saveTaskPhotoFiles(taskId: number, files: UploadedFile[]) {
  if (files.length === 0) {
    return;
  }

  const taskUploadDir = path.join(taskUploadsRoot, String(taskId));
  await mkdir(taskUploadDir, { recursive: true });
  
  const names: string[] = [];

  await Promise.all(
    files.map((file) => {
      const fileName = buildTaskPhotoFileName(file);
      names.push(fileName);
      const filePath = path.join(taskUploadDir, fileName);
      return file.mv(filePath);
    }),
  );
  
  return names;
}

tasksRouter.get("/", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = Number(req.query.projectId);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  if (!project) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      assignee: true,
      project: true,
      images: true,
    },
  });

  res.json(tasks.map(serializeTask));
});

tasksRouter.post("/", requireSessionAdminOrProjectAccess, async (req, res) => {
  const parsedBody = createTaskServerSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({ message: parsedBody.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }  

  const photoFiles = getTaskPhotoFiles(req.files);
  const photoValidationError = validateTaskPhotoFiles(photoFiles);

  if (photoValidationError) {
    res.status(400).json({ message: photoValidationError });
    return;
  }

  const assigneeId = Number(parsedBody.data.assigneeId);
  const projectId = Number(parsedBody.data.projectId);
  const authorId = Number(parsedBody.data.authorId);

  if (!Number.isInteger(assigneeId) || !Number.isInteger(projectId) || !Number.isInteger(authorId)) {
    res.status(400).json({ message: "Некорректные идентификаторы проекта, исполнителя или автора." });
    return;
  }

  const [author, assignee, project] = await Promise.all([
    prisma.user.findUnique({ where: { id: authorId } }),
    prisma.user.findUnique({ where: { id: assigneeId } }),
    prisma.project.findUnique({ where: { id: projectId } }),
  ]);

  if (!author) {
    res.status(404).json({ message: "Автор не найден." });
    return;
  }

  if (!assignee) {
    res.status(404).json({ message: "Исполнитель не найден." });
    return;
  }

  if (!project) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const task = await prisma.task.create({
    data: {
      title: parsedBody.data.title,
      description: parsedBody.data.description,
      shortDescription: buildShortDescription(parsedBody.data.description),
      priority: parsedBody.data.priority as TaskPriority,
      authorId,
      assigneeId,
      projectId,
      status: TaskStatus.NEW,
    },
    include: {
      author: true,
      assignee: true,
      project: true,
      images: true,
    },
  });

  const photoNames = await saveTaskPhotoFiles(task.id, photoFiles);

  if (photoNames && photoNames.length > 0) {
    await prisma.taskImage.createMany({
      data: photoNames.map((name) => ({
        taskId: task.id,
        name,
      })),
    });
  }

  const taskWithImages = await prisma.task.findUniqueOrThrow({
    where: { id: task.id },
    include: {
      author: true,
      assignee: true,
      project: true,
      images: true,
    },
  });

  res.status(201).json(serializeTask(taskWithImages));
});

tasksRouter.get("/:id/images/:name", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);
  const imageName = req.params.name;

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  if (typeof imageName !== "string" || imageName.trim() === "") {
    res.status(400).json({ message: "Некорректное имя фото задачи." });
    return;
  }

  if (path.basename(imageName) !== imageName) {
    res.status(400).json({ message: "Некорректное имя фото задачи." });
    return;
  }

  res.sendFile(path.join(taskUploadsRoot, String(taskId), imageName), (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: "Файл фото задачи не найден." });
    }
  });
});

tasksRouter.patch("/:id", requireSessionAdminOrTaskProjectAccess,  async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { author: true, assignee: true, project: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  const parsed = taskStatusSchema.safeParse(req.body.status);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: parsed.data as TaskStatus,
    },
    include: {
      author: true,
      assignee: true,
      project: true,
      images: true,
    },
  });

  res.json(serializeTask(task));
});

tasksRouter.delete("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  await rm(path.join(taskUploadsRoot, String(taskId)), { recursive: true, force: true });

  res.status(204).send();
});
