import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { serializeTask } from "./lib/serialize.js";
import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";
import { taskRelations } from "./lib/taskRelations.js";

export const taskGetRouter = Router();

taskGetRouter.get("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: taskRelations,
  });

  if (!task) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  res.json(serializeTask(task));
});
