import { UserRole } from "@prisma/client";
import { Router } from "express";

import { changeUserRoleSchema, createUserSchema } from "@hakaton/shared";

import { hashPassword } from "../lib/auth.js";
import { isSessionAdmin } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { serializeUser } from "../lib/serialization.js";

export const usersRouter = Router();

function normalizeProjectIds(rawProjectIds: unknown) {
  if (Array.isArray(rawProjectIds)) {
    return rawProjectIds.map(String).filter((value) => value.trim() !== "");
  }

  if (typeof rawProjectIds === "string" && rawProjectIds.trim() !== "") {
    return [rawProjectIds];
  }

  return [];
}

function parseProjectIdsFromBody(body: Record<string, unknown>) {
  const projectIdValues = normalizeProjectIds(body.projectIds);
  const fallbackProjectIdValues = normalizeProjectIds(body.projectId);

  return [...new Set(projectIdValues.length > 0 ? projectIdValues : fallbackProjectIdValues)]
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);
}

usersRouter.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
    include: { projects: true },
  });

  res.json(users.map(serializeUser));
});

usersRouter.post("/register", isSessionAdmin, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    res.status(409).json({ message: "Пользователь с таким email уже существует." });
    return;
  }

  const fallbackProjectIds = normalizeProjectIds(parsed.data.projectId);
  const projectIds = [ ...fallbackProjectIds ]
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (parsed.data.role === "USER" && projectIds.length === 0) {
    res.status(400).json({ message: "Выберите проект." });
    return;
  }

  if (projectIds.length > 0) {
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true },
    });

    if (projects.length !== projectIds.length) {
      res.status(404).json({ message: "Один или несколько проектов не найдены." });
      return;
    }
  }

  const createdUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      role: parsed.data.role as UserRole,
      projects:
        parsed.data.role === "ADMIN" || projectIds.length === 0
          ? undefined
          : {
              connect: projectIds.map((id) => ({ id })),
            },
    },
    include: { projects: true },
  });

  res.status(201).json(serializeUser(createdUser));
});

usersRouter.post("/:id/change-role", isSessionAdmin, async (req, res) => {
  const parsedParams = changeUserRoleSchema.safeParse(req.body);
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  if (!parsedParams.success) {
    res.status(400).json({ message: parsedParams.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { projects: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: parsedParams.data.role as UserRole,
      projects: parsedParams.data.role === "ADMIN" ? { set: [] } : undefined,
    },
    include: { projects: true },
  });

  res.json(serializeUser(updated));
});

usersRouter.post("/:id/assign-project", isSessionAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    include: { projects: true },
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
    include: { projects: true },
  });

  res.json(serializeUser(updated));
});

usersRouter.delete("/:id/projects/:projectId", isSessionAdmin, async (req, res) => {
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
    include: { projects: true },
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
    include: { projects: true },
  });

  res.json(serializeUser(updated));
});
