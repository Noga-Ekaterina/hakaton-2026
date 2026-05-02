import { UserRole } from "@prisma/client";
import { Router } from "express";
import { createUserSchema } from "@hakaton/shared";

import { hashPassword } from "../../lib/auth/passwords.js";
import { sendUserCreatedEmail } from "../../lib/mail.js";
import { prisma } from "../../lib/prisma.js";
import { isSessionAdmin } from "../../middleware/auth.js";
import { normalizeProjectIds } from "./lib/projectIds.js";
import { serializeUser } from "./lib/serialize.js";
import { userSelect } from "./lib/userRelations.js";

export const userRegisterRouter = Router();

userRegisterRouter.post("/register", isSessionAdmin, async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existing) {
    res.status(409).json({ message: "Пользователь с таким email уже существует." });
    return;
  }

  const fallbackProjectIds = normalizeProjectIds(parsed.data.projectId);
  const projectIds = [...fallbackProjectIds]
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (parsed.data.role === "USER" && projectIds.length === 0) {
    res.status(400).json({ message: "Выберите проект." });
    return;
  }

  if (projectIds.length > 0) {
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true },
    });

    if (projects.length !== projectIds.length) {
      res.status(404).json({ message: "Один или несколько проектов не найдены." });
      return;
    }
  }

  const createdUser = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      role: parsed.data.role as UserRole,
      projects:
        parsed.data.role === "ADMIN" || projectIds.length === 0
          ? undefined
          : {
              connect: projectIds.map((id) => ({ id })),
            },
    },
    select: userSelect,
  });

  try {
    await sendUserCreatedEmail({
      name: createdUser.name,
      email: createdUser.email,
      password: parsed.data.password,
    });
  } catch (error) {
    console.error("Failed to send user created email", error);
  }

  res.status(201).json(serializeUser(createdUser));
});
