import { Router } from "express";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { createTaskSchema, createTaskServerSchema, taskStatusSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { buildShortDescription, serializeTask } from "../lib/serialization.js";
import { requireSessionAuth } from "../middleware/auth.js";
import { requireSessionAdminOrProjectAccess } from "../middleware/projectAccess.js";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
  };
}>;

export const tasksRouter = Router();

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
      deadline: new Date(parsedBody.data.deadline),
      authorId,
      assigneeId,
      projectId,
      status: TaskStatus.NEW,
    },
    include: {
      author: true,
      assignee: true,
      project: true,
    },
  });

  res.status(201).json(serializeTask(task));
});

tasksRouter.patch("/:id", requireSessionAdminOrProjectAccess,  async (req, res) => {
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
    },
  });

  res.json(serializeTask(task));
});
