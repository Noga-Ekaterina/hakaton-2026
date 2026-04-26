import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import jwt from "jsonwebtoken";
import type express from "express";

import { prisma } from "./prisma.js";
import { sessionCookieName } from "./constants.js";

const sessionTokenTtl = "7d";

function getJwtSecret() {
  return process.env.JWT_SECRET ?? process.env.SESSION_JWT_SECRET ?? "qitask-dev-jwt-secret";
}

function getSessionToken(req: express.Request) {
  const token = req.cookies?.[sessionCookieName];

  if (typeof token !== "string" || token.trim() === "") {
    return null;
  }

  return token;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, storedPassword: string) {
  return bcrypt.compare(password, storedPassword);
}

export function createSessionToken(userId: number, role: UserRole, projectIds: number[]) {
  return jwt.sign({ role, projectIds }, getJwtSecret(), {
    subject: String(userId),
    expiresIn: sessionTokenTtl,
  });
}

function getSessionPayload(req: express.Request) {
  const rawValue = getSessionToken(req);

  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return null;
  }

  try {
    const payload = jwt.verify(rawValue, getJwtSecret());

    if (typeof payload === "string" || !payload || typeof payload !== "object" || typeof payload.sub !== "string") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getSessionUserId(req: express.Request) {
  const payload = getSessionPayload(req);

  if (!payload) {
    return null;
  }

  const userId = Number(payload.sub);
  return Number.isInteger(userId) ? userId : null;
}

export function getSessionUserRole(req: express.Request) {
  const payload = getSessionPayload(req);

  if (!payload || typeof payload.role !== "string") {
    return null;
  }

  return payload.role as UserRole;
}

export async function requireSessionUser(req: express.Request, res: express.Response) {
  const userId = getSessionUserId(req);

  if (!userId) {
    res.status(401).json({ message: "Сессия не найдена." });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { projects: true },
  });

  if (!user) {
    res.status(401).json({ message: "Сессия не найдена." });
    return null;
  }

  return user;
}
