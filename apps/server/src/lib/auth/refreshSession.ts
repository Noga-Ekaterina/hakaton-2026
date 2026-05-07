import crypto from "node:crypto";

import type express from "express";

import { refreshTokenCookieName, refreshTokenMaxAgeMs } from "./cookies.js";
import { prisma } from "../prisma.js";
import { userSelect } from "../../routes/users/lib/userRelations.js";

export function getRefreshToken(req: express.Request) {
  const token = req.cookies?.[refreshTokenCookieName];

  if (typeof token !== "string" || token.trim() === "") {
    return null;
  }

  return token;
}

function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createRefreshTokenValue() {
  return crypto.randomBytes(32).toString("base64url");
}

export async function createRefreshSession(userId: number) {
  const token = createRefreshTokenValue();
  const expiresAt = new Date(Date.now() + refreshTokenMaxAgeMs);

  await prisma.refreshSession.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(token),
      expiresAt,
    },
  });

  return token;
}

export async function rotateRefreshSession(token: string) {
  const tokenHash = hashRefreshToken(token);
  const refreshSession = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: { user: { select: userSelect } },
  });

  if (!refreshSession || refreshSession.expiresAt <= new Date()) {
    if (refreshSession) {
      await prisma.refreshSession.delete({ where: { id: refreshSession.id } });
    }

    return null;
  }

  const nextToken = createRefreshTokenValue();
  const nextExpiresAt = new Date(Date.now() + refreshTokenMaxAgeMs);

  await prisma.refreshSession.update({
    where: { id: refreshSession.id },
    data: {
      tokenHash: hashRefreshToken(nextToken),
      expiresAt: nextExpiresAt,
    },
  });

  return {
    refreshToken: nextToken,
    user: refreshSession.user,
  };
}

export async function deleteRefreshSession(token: string | null) {
  if (!token) {
    return;
  }

  await prisma.refreshSession.deleteMany({
    where: { tokenHash: hashRefreshToken(token) },
  });
}
