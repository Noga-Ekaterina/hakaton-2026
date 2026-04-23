import { Router } from "express";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { createTaskSchema, taskStatusSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { buildShortDescription, serializeTask } from "../lib/serialization.js";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
  };
}>;

export const tasksRouter = Router();

tasksRouter.get("/", async (_req, res) => {
  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      assignee: true,
      project: true,
    },
  });

  res.json(tasks.map(serializeTask));
});

tasksRouter.post("/", async (req, res) => {
  const parsedBody = createTaskSchema.safeParse(req.body);
  const authorId = Number(req.body.authorId);

  if (!parsedBody.success) {
    res.status(400).json({ message: parsedBody.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  if (!Number.isInteger(authorId)) {
    res.status(400).json({ message: "Некорректный идентификатор автора." });
    return;
  }

  const assigneeId = Number(parsedBody.data.assigneeId);
  const projectId = Number(parsedBody.data.projectId);

  if (!Number.isInteger(assigneeId) || !Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректные идентификаторы проекта или исполнителя." });
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

tasksRouter.patch("/:id", async (req, res) => {
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
