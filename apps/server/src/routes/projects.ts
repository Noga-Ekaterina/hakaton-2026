import { Router } from "express";
import { createProjectSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { serializeProject } from "../lib/serialization.js";
import { isSessionAdmin } from "../middleware/auth.js";
import { requireSessionAuth } from "../middleware/auth.js";

export const projectsRouter = Router();

projectsRouter.get("/", requireSessionAuth, async (_req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { id: "asc" },
  });

  res.json(projects.map(serializeProject));
});

projectsRouter.post("/", isSessionAdmin, async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const project = await prisma.project.create({
    data: { name: parsed.data.name },
  });

  res.status(201).json(serializeProject(project));
});

projectsRouter.patch("/:id", isSessionAdmin, async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!existing) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name: parsed.data.name },
  });

  res.json(serializeProject(project));
});
