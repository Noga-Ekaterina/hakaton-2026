import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type express from "express";

import { prisma } from "./prisma.js";
import { sessionCookieName } from "./constants.js";

const sessionTokenTtl = "7d";

function getJwtSecret() {
  return process.env.JWT_SECRET ?? process.env.SESSION_JWT_SECRET ?? "qitask-dev-jwt-secret";
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, storedPassword: string) {
  return bcrypt.compare(password, storedPassword);
}

export function createSessionToken(userId: number) {
  return jwt.sign({}, getJwtSecret(), {
    subject: String(userId),
    expiresIn: sessionTokenTtl,
  });
}

export function getSessionUserId(req: express.Request) {
  const rawValue = req.cookies?.[sessionCookieName];

  if (typeof rawValue !== "string" || rawValue.trim() === "") {
    return null;
  }

  try {
    const payload = jwt.verify(rawValue, getJwtSecret());

    if (typeof payload === "string" || !payload || typeof payload !== "object" || typeof payload.sub !== "string") {
      return null;
    }

    const userId = Number(payload.sub);
    return Number.isInteger(userId) ? userId : null;
  } catch {
    return null;
  }
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
