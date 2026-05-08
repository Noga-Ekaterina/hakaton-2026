import { Router } from "express";
import { createProjectSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { serializeProject } from "./lib/serialize.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { requireSessionAuth } from "../../middleware/auth.js";
import { projectTagsRouter } from "./tags.js";
import { deleteTaskUploadDir } from "../../lib/taskPhotoFiles.js";
import { adminRole } from "../../lib/constants.js";

export const projectsRouter = Router();

projectsRouter.use("/:projectId/tags", projectTagsRouter);

const projectSelect = {
  id: true,
  name: true,
} as const;

const projectListSelect = {
  ...projectSelect,
  users: {
    where: {
      archivedAt: null,
    },
    select: {
      role: true,
    },
  },
} as const;

projectsRouter.get("/", requireSessionAuth, async (_req, res) => {
  const sessionUser = res.locals.sessionUser;
  const isAdmin = sessionUser?.role === adminRole;

  const [adminCount, projects] = await Promise.all([
    prisma.user.count({
      where: {
        role: adminRole,
        archivedAt: null,
      },
    }),
    prisma.project.findMany({
      where: isAdmin ? undefined : { users: { some: { id: sessionUser.id } } },
      orderBy: { id: "asc" },
      select: projectListSelect,
    }),
  ]);

  res.json(
    projects.map((project) =>
      serializeProject({
        id: project.id,
        name: project.name,
        memberCount: adminCount + project.users.filter((user) => user.role !== adminRole).length,
      }),
    ),
  );
});

projectsRouter.post("/", isSessionAdmin, async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const project = await prisma.project.create({
    data: { name: parsed.data.name },
    select: projectSelect,
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
    select: { id: true },
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
    select: projectSelect,
  });

  res.json(serializeProject(project));
});

projectsRouter.delete("/:id", isSessionAdmin, async (req, res) => {
  const projectId = Number(req.params.id);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      tasks: {
        select: { id: true },
      },
    },
  });

  if (!existing) {
    res.status(404).json({ message: "Проект не найден." });
    return;
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  await Promise.all(existing.tasks.map((task) => deleteTaskUploadDir(task.id)));

  res.status(204).send();
});
