import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { serializeTaskComment, serializeTaskEvent } from "./lib/serialize.js";
import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";

export const taskTimelineRouter = Router();

taskTimelineRouter.get("/:id/timeline", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Invalid task id." });
    return;
  }

  const [comments, events] = await Promise.all([
    prisma.taskComment.findMany({
      where: { taskId },
      include: { author: true },
    }),
    prisma.taskEvent.findMany({
      where: { taskId },
      include: { actor: true },
    }),
  ]);

  const timeline = [
    ...comments.map(serializeTaskComment),
    ...events.map(serializeTaskEvent),
  ].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

  res.json(timeline);
});
