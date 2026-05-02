import { Router } from "express";
import { createTaskCommentSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { serializeTaskComment } from "./lib/serialize.js";
import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";
import { getSessionUserId } from "./lib/session.js";

export const taskCommentsRouter = Router();

taskCommentsRouter.post("/:id/comments", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Invalid task id." });
    return;
  }

  const parsed = createTaskCommentSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid comment." });
    return;
  }

  const authorId = getSessionUserId(res);

  if (!authorId) {
    res.status(401).json({ message: "Session not found." });
    return;
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      authorId,
      body: parsed.data.body,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  res.status(201).json(serializeTaskComment(comment));
});
