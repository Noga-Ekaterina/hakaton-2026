import { Router } from "express";
import path from "node:path";

import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";
import { taskUploadsRoot } from "./lib/photoFiles.js";

export const taskPhotosRouter = Router();

taskPhotosRouter.get("/:id/images/:name", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);
  const imageName = req.params.name;

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  if (typeof imageName !== "string" || imageName.trim() === "") {
    res.status(400).json({ message: "Некорректное имя фото задачи." });
    return;
  }

  if (path.basename(imageName) !== imageName) {
    res.status(400).json({ message: "Некорректное имя фото задачи." });
    return;
  }

  res.sendFile(path.join(taskUploadsRoot, String(taskId), imageName), (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({ message: "Файл фото задачи не найден." });
    }
  });
});
