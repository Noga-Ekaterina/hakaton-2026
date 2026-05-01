import { Router } from "express";
import type express from "express";
import type { FileArray, UploadedFile } from "express-fileupload";
import { randomUUID } from "node:crypto";
import { mkdir, rm, unlink } from "node:fs/promises";
import path from "node:path";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import {
  createTaskCommentSchema,
  createTaskServerSchema,
  updateTaskServerSchema,
  type TaskChange,
} from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { buildShortDescription, serializeTask, serializeTaskComment, serializeTaskEvent } from "../lib/serialization.js";
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

function parseKeepImageIds(value: unknown) {
  if (typeof value === "undefined") {
    return null;
  }

  const rawValues = Array.isArray(value) ? value : [value];
  const ids = rawValues
    .flatMap((item) => String(item).split(","))
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item > 0);

  return new Set(ids);
}

async function deleteTaskPhotoFiles(taskId: number, imageNames: string[]) {
  await Promise.all(
    imageNames.map((name) =>
      unlink(path.join(taskUploadsRoot, String(taskId), name)).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }),
    ),
  );
}

function getSessionUserId(res: express.Response) {
  const userId = res.locals.sessionUser?.id;
  return typeof userId === "number" ? userId : null;
}

function addChange(changes: TaskChange[], field: string, oldValue: unknown, newValue: unknown) {
  if (oldValue === newValue) {
    return;
  }

  changes.push({
    field,
    oldValue,
    newValue,
  });
}

function buildTaskUpdateChanges(
  existing: TaskWithRelations,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assigneeId?: number;
    storyPoints?: number | null;
  },
) {
  const changes: TaskChange[] = [];

  addChange(changes, "title", existing.title, data.title);
  addChange(changes, "description", existing.description, data.description);
  addChange(changes, "priority", existing.priority, data.priority);
  addChange(changes, "assigneeId", existing.assigneeId, data.assigneeId);

  return changes.filter((change) => typeof change.newValue !== "undefined");
}

function buildSingleChange(field: string, oldValue: unknown, newValue: unknown) {
  if (typeof newValue === "undefined" || oldValue === newValue) {
    return null;
  }

  return {
    field,
    oldValue,
    newValue,
  };
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

tasksRouter.get("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "РќРµРєРѕСЂСЂРµРєС‚РЅС‹Р№ РёРґРµРЅС‚РёС„РёРєР°С‚РѕСЂ Р·Р°РґР°С‡Рё." });
    return;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      author: true,
      assignee: true,
      project: true,
      images: true,
    },
  });

  if (!task) {
    res.status(404).json({ message: "Р—Р°РґР°С‡Р° РЅРµ РЅР°Р№РґРµРЅР°." });
    return;
  }

  res.json(serializeTask(task));
});

tasksRouter.get("/:id/timeline", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Invalid task id." });
    return;
  }

  const [comments, events] = await Promise.all([
    prisma.taskComment.findMany({
      where: { taskId },
      include: { author: true },
    }),
    prisma.taskEvent.findMany({
      where: { taskId },
      include: { actor: true },
    }),
  ]);

  const timeline = [
    ...comments.map(serializeTaskComment),
    ...events.map(serializeTaskEvent),
  ].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  res.json(timeline);
});

tasksRouter.post("/:id/comments", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Invalid task id." });
    return;
  }

  const parsed = createTaskCommentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid comment." });
    return;
  }

  const authorId = getSessionUserId(res);

  if (!authorId) {
    res.status(401).json({ message: "Session not found." });
    return;
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      authorId,
      body: parsed.data.body,
    },
    include: { author: true },
  });

  res.status(201).json(serializeTaskComment(comment));
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

  await prisma.taskEvent.create({
    data: {
      taskId: task.id,
      actorId: getSessionUserId(res),
      type: "TASK_CREATED",
      metadata: {
        title: task.title,
      },
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

tasksRouter.patch("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    include: { author: true, assignee: true, project: true, images: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  const parsed = updateTaskServerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const photoFiles = getTaskPhotoFiles(req.files);
  const photoValidationError = validateTaskPhotoFiles(photoFiles);

  if (photoValidationError) {
    res.status(400).json({ message: photoValidationError });
    return;
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: parsed.data.assigneeId } });

    if (!assignee) {
      res.status(404).json({ message: "Исполнитель не найден." });
      return;
    }
  }

  const keepImageIds = parseKeepImageIds(req.body.keepImageIds);
  const imagesToDelete = keepImageIds
    ? existing.images.filter((image) => !keepImageIds.has(image.id))
    : [];
    
  const changes = buildTaskUpdateChanges(existing, parsed.data);
  const statusChange = buildSingleChange("status", existing.status, parsed.data.status);
  const storyPointsChange = buildSingleChange("storyPoints", existing.storyPoints, parsed.data.storyPoints);
  const photoNames = await saveTaskPhotoFiles(taskId, photoFiles);

  if (imagesToDelete.length > 0 || (photoNames && photoNames.length > 0)) {
    changes.push({
      field: "images",
      oldValue: existing.images.map((image) => image.name),
      newValue: [
        ...existing.images.filter((image) => !imagesToDelete.some((deletedImage) => deletedImage.id === image.id)).map((image) => image.name),
        ...(photoNames ?? []),
      ],
    });
  }

  const task = await prisma.$transaction(async (tx) => {
    if (imagesToDelete.length > 0) {
      await tx.taskImage.deleteMany({
        where: {
          id: { in: imagesToDelete.map((image) => image.id) },
          taskId,
        },
      });
    }

    if (photoNames && photoNames.length > 0) {
      await tx.taskImage.createMany({
        data: photoNames.map((name) => ({
          taskId,
          name,
        })),
      });
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        shortDescription: typeof parsed.data.description === "string" ? buildShortDescription(parsed.data.description) : undefined,
        priority: parsed.data.priority as TaskPriority | undefined,
        status: parsed.data.status as TaskStatus | undefined,
        assigneeId: parsed.data.assigneeId,
        storyPoints: parsed.data.storyPoints,
      },
      include: {
        author: true,
        assignee: true,
        project: true,
        images: true,
      },
    });

    if (changes.length > 0) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "TASK_UPDATED",
          changes: changes as Prisma.InputJsonValue,
        },
      });
    }

    if (statusChange) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "STATUS_UPDATED",
          changes: [statusChange] as Prisma.InputJsonValue,
        },
      });
    }

    if (storyPointsChange) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "STORY_POINTS_UPDATED",
          changes: [storyPointsChange] as Prisma.InputJsonValue,
        },
      });
    }

    return updatedTask;
  });

  if (imagesToDelete.length > 0) {
    await deleteTaskPhotoFiles(taskId, imagesToDelete.map((image) => image.name));
  }

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
