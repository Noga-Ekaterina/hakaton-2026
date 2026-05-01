import { Router } from "express";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { createTaskServerSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { buildShortDescription, serializeTask } from "./lib/serialize.js";
import { requireSessionAdminOrProjectAccess } from "../../middleware/projectAccess.js";
import { getTaskPhotoFiles, saveTaskPhotoFiles, validateTaskPhotoFiles } from "./lib/photoFiles.js";
import { getSessionUserId } from "./lib/session.js";
import { taskRelations } from "./lib/taskRelations.js";

export const taskCreateRouter = Router();

taskCreateRouter.post("/", requireSessionAdminOrProjectAccess, async (req, res) => {
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
    include: taskRelations,
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
    include: taskRelations,
  });

  res.status(201).json(serializeTask(taskWithImages));
});
