import type express from "express";
import { Router } from "express";
import type { UserRole } from "@prisma/client";

import { loginSchema } from "@hakaton/shared";

import { verifyPassword } from "../lib/auth/passwords.js";
import { accessTokenCookieName, accessTokenCookieOptions, refreshTokenCookieName, refreshTokenCookieOptions } from "../lib/auth/cookies.js";
import { createRefreshSession, deleteRefreshSession, getRefreshToken, rotateRefreshSession } from "../lib/auth/refreshSession.js";
import { createAccessToken, requireSessionUser } from "../lib/auth/session.js";
import { requireSessionAuth } from "../middleware/auth.js";
import { prisma } from "../lib/prisma.js";
import { serializeUser } from "./users/lib/serialize.js";
import { userWithPasswordSelect } from "./users/lib/userRelations.js";

export const authRouter = Router();

function getProjectIds(user: { projects: Array<{ id: number }> }) {
  return user.projects.map((project) => project.id);
}

async function setAuthCookies(
  res: express.Response,
  user: { id: number; role: UserRole; projects: Array<{ id: number }> },
) {
  const accessToken = createAccessToken(user.id, user.role, getProjectIds(user));
  const refreshToken = await createRefreshSession(user.id);

  res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);
  res.cookie(refreshTokenCookieName, refreshToken, refreshTokenCookieOptions);
}

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: userWithPasswordSelect,
  });

  if (!user || user.archivedAt || !(await verifyPassword(parsed.data.password, user.password))) {
    res.status(401).json({ message: "Неверный email или пароль." });
    return;
  }

  await setAuthCookies(res, user);
  res.json(serializeUser(user));
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = getRefreshToken(req);

  if (!refreshToken) {
    res.status(401).json({ message: "Сессия не найдена." });
    return;
  }

  const rotatedSession = await rotateRefreshSession(refreshToken);

  if (!rotatedSession) {
    res.clearCookie(accessTokenCookieName, accessTokenCookieOptions);
    res.clearCookie(refreshTokenCookieName, refreshTokenCookieOptions);
    res.status(401).json({ message: "Сессия не найдена." });
    return;
  }

  const user = rotatedSession.user;
  const accessToken = createAccessToken(user.id, user.role, getProjectIds(user));

  res.cookie(accessTokenCookieName, accessToken, accessTokenCookieOptions);
  res.cookie(refreshTokenCookieName, rotatedSession.refreshToken, refreshTokenCookieOptions);
  res.json(serializeUser(user));
});

authRouter.get("/me", requireSessionAuth, async (req, res) => {
  const user = res.locals.sessionUser ?? (await requireSessionUser(req, res));

  if (!user) {
    return;
  }

  res.json(serializeUser(user));
});

authRouter.post("/logout", async (req, res) => {
  await deleteRefreshSession(getRefreshToken(req));
  res.clearCookie(accessTokenCookieName, accessTokenCookieOptions);
  res.clearCookie(refreshTokenCookieName, refreshTokenCookieOptions);
  res.status(204).end();
});
