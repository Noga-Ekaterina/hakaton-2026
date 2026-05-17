import { Router } from "express";
import { Prisma } from "@prisma/client";
import { updateTaskStoryPointsSchema } from "@hakaton/shared";

import { requireSessionUser } from "../../lib/auth/session.js";
import { prisma } from "../../lib/prisma.js";
import { buildSingleChange } from "./lib/changes.js";
import { serializeTask } from "./lib/serialize.js";
import { taskDetailSelect } from "./lib/taskRelations.js";

export const taskStoryPointsRouter = Router();

taskStoryPointsRouter.patch("/:id/story-points", async (req, res) => {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const parsed = updateTaskStoryPointsSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: taskDetailSelect,
  });

  if (!existing) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  const canEditStoryPoints = existing.authorId === user.id || existing.assigneeId === user.id;

  if (!canEditStoryPoints) {
    res.status(403).json({ message: "Редактирование story points доступно только автору и исполнителю задачи." });
    return;
  }

  const storyPointsChange = buildSingleChange("storyPoints", existing.storyPoints, parsed.data.storyPoints);

  const task = await prisma.$transaction(async (tx) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        storyPoints: parsed.data.storyPoints,
      },
      select: taskDetailSelect,
    });

    if (storyPointsChange) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: user.id,
          type: "STORY_POINTS_UPDATED",
          changes: [storyPointsChange] as Prisma.InputJsonValue,
        },
      });
    }

    return updatedTask;
  });

  res.json(serializeTask(task));
});
