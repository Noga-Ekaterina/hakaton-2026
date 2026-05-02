import { Router } from "express";
import { taskTagInputSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { requireSessionAdminOrProjectAccess } from "../../middleware/projectAccess.js";
import { serializeTaskTag } from "./lib/tags.js";

export const projectTagsRouter = Router({ mergeParams: true });

function parseProjectId(value: unknown) {
  const projectId = Number(value);
  return Number.isInteger(projectId) ? projectId : null;
}

function parseTagId(value: unknown) {
  const tagId = Number(value);
  return Number.isInteger(tagId) ? tagId : null;
}

async function projectExists(projectId: number) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true },
  });

  return Boolean(project);
}

projectTagsRouter.get("/", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = parseProjectId(req.params.projectId);

  if (!projectId) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  if (!(await projectExists(projectId))) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const tags = await prisma.taskTag.findMany({
    where: { projectId },
    orderBy: { id: "asc" },
  });

  res.json(tags.map(serializeTaskTag));
});

projectTagsRouter.post("/", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = parseProjectId(req.params.projectId);

  if (!projectId) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  if (!(await projectExists(projectId))) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  const parsed = taskTagInputSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные тега." });
    return;
  }

  const tag = await prisma.taskTag.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      projectId,
    },
  });

  res.status(201).json(serializeTaskTag(tag));
});

projectTagsRouter.patch("/:tagId", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = parseProjectId(req.params.projectId);
  const tagId = parseTagId(req.params.tagId);

  if (!projectId || !tagId) {
    res.status(400).json({ message: "Некорректный идентификатор проекта или тега." });
    return;
  }

  const parsed = taskTagInputSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные тега." });
    return;
  }

  const existing = await prisma.taskTag.findFirst({
    where: { id: tagId, projectId },
  });

  if (!existing) {
    res.status(404).json({ message: "Тег не найден." });
    return;
  }

  const tag = await prisma.taskTag.update({
    where: { id: tagId },
    data: parsed.data,
  });

  res.json(serializeTaskTag(tag));
});

projectTagsRouter.delete("/:tagId", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = parseProjectId(req.params.projectId);
  const tagId = parseTagId(req.params.tagId);

  if (!projectId || !tagId) {
    res.status(400).json({ message: "Некорректный идентификатор проекта или тега." });
    return;
  }

  const existing = await prisma.taskTag.findFirst({
    where: { id: tagId, projectId },
  });

  if (!existing) {
    res.status(404).json({ message: "Тег не найден." });
    return;
  }

  await prisma.taskTag.delete({
    where: { id: tagId },
  });

  res.status(204).send();
});
