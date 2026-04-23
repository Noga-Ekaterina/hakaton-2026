import { Router } from "express";

import { UserRole } from "@prisma/client";
import { taskPrioritySchema, taskStatusSchema } from "@hakaton/shared";

import { prisma } from "../lib/prisma.js";
import { serializeProject, serializeUser, toIso } from "../lib/serialization.js";

export const metaRouter = Router();

metaRouter.get("/meta", async (_req, res) => {
  const [projects, users] = await Promise.all([
    prisma.project.findMany({ orderBy: { id: "asc" } }),
    prisma.user.findMany({
      orderBy: { id: "asc" },
      include: { projects: true },
    }),
  ]);

  res.json({
    projects: projects.map((project: (typeof projects)[number]) => ({
      ...serializeProject(project),
      description: null,
    })),
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
