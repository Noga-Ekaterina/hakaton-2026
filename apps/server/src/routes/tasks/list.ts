import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { serializeTask } from "./lib/serialize.js";
import { requireSessionAdminOrProjectAccess } from "../../middleware/projectAccess.js";
import { taskRelations } from "./lib/taskRelations.js";

export const taskListRouter = Router();

taskListRouter.get("/", requireSessionAdminOrProjectAccess, async (req, res) => {
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
    include: taskRelations,
  });

  res.json(tasks.map(serializeTask));
});
