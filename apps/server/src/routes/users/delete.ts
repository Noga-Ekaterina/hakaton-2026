import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { getSessionUserId } from "../../lib/auth/session.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { serializeUser } from "./lib/serialize.js";
import { userSelect } from "./lib/userRelations.js";

export const userDeleteRouter = Router();

userDeleteRouter.delete("/:id", isSessionAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  if (getSessionUserId(req) === userId) {
    res.status(409).json({ message: "Нельзя удалить свой аккаунт." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, archivedAt: true },
  });

  if (!existing || existing.archivedAt) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  await prisma.$transaction([
    prisma.refreshSession.deleteMany({ where: { userId } }),
    prisma.user.update({
      where: { id: userId },
      data: { archivedAt: new Date() },
    }),
  ]);

  res.status(204).send();
});

userDeleteRouter.post("/:id/restore", isSessionAdmin, async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, archivedAt: true },
  });

  if (!existing || !existing.archivedAt) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const restored = await prisma.user.update({
    where: { id: userId },
    data: { archivedAt: null },
    select: userSelect,
  });

  res.json(serializeUser(restored));
});
