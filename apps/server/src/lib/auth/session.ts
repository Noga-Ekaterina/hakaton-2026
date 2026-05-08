import type { UserRole } from "@prisma/client";
import type express from "express";
import jwt from "jsonwebtoken";

import { accessTokenCookieName } from "./cookies.js";
import { prisma } from "../prisma.js";
import { userSelect } from "../../routes/users/lib/userRelations.js";

const accessTokenTtl = "5m";

function getJwtSecret() {
  return process.env.JWT_SECRET ?? process.env.ACCESS_JWT_SECRET ?? "qitask-dev-jwt-secret";
}

function getAccessToken(req: express.Request) {
  const token = req.cookies?.[accessTokenCookieName];

  if (typeof token !== "string" || token.trim() === "") {
    return null;
  }

  return token;
}

export function createAccessToken(userId: number, role: UserRole, projectIds: number[]) {
  return jwt.sign({ role, projectIds }, getJwtSecret(), {
    subject: String(userId),
    expiresIn: accessTokenTtl,
  });
}

function getAccessPayload(req: express.Request) {
  const rawValue = getAccessToken(req);

  if (!rawValue) {
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
  const payload = getAccessPayload(req);

  if (!payload) {
    return null;
  }

  const userId = Number(payload.sub);
  return Number.isInteger(userId) ? userId : null;
}

export function getSessionUserRole(req: express.Request) {
  const payload = getAccessPayload(req);

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
    select: userSelect,
  });

  if (!user || user.archivedAt) {
    res.status(401).json({ message: "Сессия не найдена." });
    return null;
  }

  return user;
}
