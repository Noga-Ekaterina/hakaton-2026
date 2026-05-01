import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { parseProjectIdsFromBody } from "./lib/projectIds.js";
import { serializeUser } from "./lib/serialize.js";
import { userRelations } from "./lib/userRelations.js";

export const userProjectsRouter = Router();

userProjectsRouter.post("/:id/assign-project", isSessionAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: userRelations,
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const projectIds = parseProjectIdsFromBody(req.body as Record<string, unknown>);

  if (projectIds.length === 0) {
    res.status(400).json({ message: "Выберите проект." });
    return;
  }

  const projects = await prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: { id: true },
  });

  if (projects.length !== projectIds.length) {
    res.status(404).json({ message: "Один или несколько проектов не найдены." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      projects: {
        connect: projectIds.map((id) => ({ id })),
      },
    },
    include: userRelations,
  });

  res.json(serializeUser(updated));
});

userProjectsRouter.delete("/:id/projects/:projectId", isSessionAdmin, async (req, res) => {
  const userId = Number(req.params.id);
  const projectId = Number(req.params.projectId);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: userRelations,
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const projectExists = existing.projects.some((project) => project.id === projectId);

  if (!projectExists) {
    res.status(404).json({ message: "Пользователь не привязан к этому проекту." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      projects: {
        disconnect: { id: projectId },
      },
    },
    include: userRelations,
  });

  res.json(serializeUser(updated));
});
