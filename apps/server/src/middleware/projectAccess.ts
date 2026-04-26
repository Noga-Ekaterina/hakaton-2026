import type express from "express";

import { requireSessionUser } from "../lib/auth.js";

const adminRole = "ADMIN";

// достаёт projectId, поддерживает разные форматы (число, строка, массив)
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

// определяет projectId из разных частей запроса (query, body)
function getRequestedProjectId(req: express.Request) {
  const queryProjectId = parseProjectId(req.query.projectId);

  if (queryProjectId) {
    return queryProjectId;
  }

  if (req.body && typeof req.body === "object") {
    return parseProjectId((req.body as Record<string, unknown>).projectId);
  }

  return null;
}

// middleware для проверки доступа к проекту: админ или участник проекта
export async function requireSessionAdminOrProjectAccess(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await requireSessionUser(req, res);

  if (!user) {
    res.status(401).json({ message: "Сессия не найдена." });
    return;
  }

  if (user.role === adminRole) {
    res.locals.sessionUser = user;
    next();
    return;
  }

  const projectId = getRequestedProjectId(req);

  if (!projectId) {
    res.status(400).json({ message: "Нужно указать projectId." });
    return;
  }

  const hasProjectAccess = user.projects.some((project) => project.id === projectId);

  if (!hasProjectAccess) {
    res.status(403).json({ message: "Доступ запрещен." });
    return;
  }

  res.locals.sessionUser = user;
  next();
}
