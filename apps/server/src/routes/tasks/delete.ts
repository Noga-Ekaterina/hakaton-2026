import { Router } from "express";

import { prisma } from "../../lib/prisma.js";
import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";
import { deleteTaskUploadDir } from "../../lib/taskPhotoFiles.js";

export const taskDeleteRouter = Router();

taskDeleteRouter.delete("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  await prisma.task.delete({
    where: { id: taskId },
  });

  await deleteTaskUploadDir(taskId);

  res.status(204).send();
});
