import type express from "express";

import { requireSessionUser } from "../lib/auth/session.js";
import { adminRole } from "../lib/constants.js";

export async function isSessionAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  if (user.role !== adminRole) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  res.locals.sessionUser = user;
  next();
}

export async function requireSessionAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  res.locals.sessionUser = user;
  next();
}
