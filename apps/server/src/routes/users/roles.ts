import { UserRole } from "@prisma/client";
import { Router } from "express";
import { changeUserRoleSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { serializeUser } from "./lib/serialize.js";
import { userSelect } from "./lib/userRelations.js";

export const userRolesRouter = Router();

userRolesRouter.post("/:id/change-role", isSessionAdmin, async (req, res) => {
  const parsedParams = changeUserRoleSchema.safeParse(req.body);
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId)) {
    res.status(400).json({ message: "Некорректный идентификатор пользователя." });
    return;
  }

  if (!parsedParams.success) {
    res.status(400).json({ message: parsedParams.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existing) {
    res.status(404).json({ message: "Пользователь не найден." });
    return;
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      role: parsedParams.data.role as UserRole,
      projects: parsedParams.data.role === "ADMIN" ? { set: [] } : undefined,
    },
    select: userSelect,
  });

  res.json(serializeUser(updated));
});
