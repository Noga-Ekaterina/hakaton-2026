import { Router } from "express";

import { UserRole } from "@prisma/client";
import { taskPrioritySchema, taskStatusSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { toIso } from "../lib/dates.js";
import { serializeUser } from "./users/lib/serialize.js";
import { requireSessionAdminOrProjectAccess } from "../middleware/projectAccess.js";

export const metaRouter = Router();

metaRouter.get("/meta", requireSessionAdminOrProjectAccess, async (req, res) => {
  const projectId = Number(req.query.projectId);

  if (!Number.isInteger(projectId)) {
    res.status(400).json({ message: "Некорректный идентификатор проекта." });
    return;
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [{ role: UserRole.ADMIN }, { projects: { some: { id: projectId } } }],
    },
    orderBy: { id: "asc" },
    include: { projects: true },
  });

  res.json({
    users: users.map((user: (typeof users)[number]) => ({
      ...serializeUser(user),
      createdAt: toIso(user.createdAt),
      active: true,
    })),
    roles: ["USER", "ADMIN"] as UserRole[],
    taskStatuses: taskStatusSchema.options,
    taskPriorities: taskPrioritySchema.options,
  });
});
