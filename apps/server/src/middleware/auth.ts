import type express from "express";

import { getSessionUserRole, requireSessionUser } from "../lib/auth.js";

const adminRole = "ADMIN";

export function isSessionAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const role = getSessionUserRole(req);

  if (!role) {
    res.status(401).json({ message: "Сессия не найдена." });
    return;
  }

  if (role !== adminRole) {
    res.status(403).json({ message: "Доступ запрещен." });
    return;
  }

  next();
}

export async function requireSessionAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await requireSessionUser(req, res);

  if (!user) {
    res.status(401).json({ message: "Сессия не найдена." });
    return;
  }

  res.locals.sessionUser = user;
  next();
}
