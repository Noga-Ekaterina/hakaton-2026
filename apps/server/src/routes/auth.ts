import { Router } from "express";

import { loginSchema } from "@hakaton/shared";

import { createSessionToken, requireSessionUser, verifyPassword } from "../lib/auth.js";
import { sessionCookieName } from "../lib/constants.js";
import { prisma } from "../lib/prisma.js";
import { serializeUser } from "../lib/serialization.js";

export const authRouter = Router();

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { projects: true },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    res.status(401).json({ message: "Неверный email или пароль." });
    return;
  }

  const token = createSessionToken(user.id);

  res.cookie(sessionCookieName, token, sessionCookieOptions);
  res.json(serializeUser(user));
});

authRouter.get("/me", async (req, res) => {
  const user = await requireSessionUser(req, res);

  if (!user) {
    return;
  }

  res.json(serializeUser(user));
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(sessionCookieName, sessionCookieOptions);
  res.status(204).end();
});
