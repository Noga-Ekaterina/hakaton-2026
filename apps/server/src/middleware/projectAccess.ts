import type express from "express";

import { requireSessionUser } from "../lib/auth/session.js";
import { prisma } from "../lib/prisma.js";

const adminRole = "ADMIN";

function parseProjectId(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : null;
  }

  if (Array.isArray(value) && value.length > 0) {
    return parseProjectId(value[0]);
  }

  return null;
}

function getRequestedProjectId(req: express.Request) {
  const paramsProjectId = parseProjectId(req.params.projectId);

  if (paramsProjectId) {
    return paramsProjectId;
  }

  const queryProjectId = parseProjectId(req.query.projectId);

  if (queryProjectId) {
    return queryProjectId;
  }

  if (req.body && typeof req.body === "object") {
    return parseProjectId((req.body as Record<string, unknown>).projectId);
  }

  return null;
}

async function requireProjectAccess(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  projectId: number | null,
) {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  if (!projectId) {
    res.status(400).json({ message: "projectId is required." });
    return;
  }

  if (user.role === adminRole) {
    res.locals.sessionUser = user;
    next();
    return;
  }

  const hasProjectAccess = user.projects.some((project) => project.id === projectId);

  if (!hasProjectAccess) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  res.locals.sessionUser = user;
  next();
}

export async function requireSessionAdminOrProjectAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  await requireProjectAccess(req, res, next, getRequestedProjectId(req));
}

export async function requireSessionAdminOrTaskProjectAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Invalid task id." });
    return;
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });

  if (!task) {
    res.status(404).json({ message: "Task not found." });
    return;
  }

  res.locals.taskProjectId = task.projectId;
  await requireProjectAccess(req, res, next, task.projectId);
}
