import { Router } from "express";
import { Prisma, TaskPriority, TaskStatus } from "@prisma/client";
import { updateTaskServerSchema } from "@hakaton/shared";

import { prisma } from "../../lib/prisma.js";
import { serializeTask } from "./lib/serialize.js";
import { requireSessionAdminOrTaskProjectAccess } from "../../middleware/projectAccess.js";
import { buildSingleChange, buildTaskTagsChange, buildTaskUpdateChanges } from "./lib/changes.js";
import {
  deleteTaskPhotoFiles,
  getTaskPhotoFiles,
  parseKeepImageIds,
  saveTaskPhotoFiles,
  validateTaskPhotoFiles,
} from "../../lib/taskPhotoFiles.js";
import { getSessionUserId } from "./lib/session.js";
import { taskDetailSelect } from "./lib/taskRelations.js";
import { getProjectTagsByIds, toTaskTagConnections, validateProjectTagIds } from "./lib/tags.js";

export const taskUpdateRouter = Router();

taskUpdateRouter.patch("/:id", requireSessionAdminOrTaskProjectAccess, async (req, res) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId)) {
    res.status(400).json({ message: "Некорректный идентификатор задачи." });
    return;
  }

  const existing = await prisma.task.findUnique({
    where: { id: taskId },
    select: taskDetailSelect,
  });

  if (!existing) {
    res.status(404).json({ message: "Задача не найдена." });
    return;
  }

  const parsed = updateTaskServerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Некорректные данные" });
    return;
  }

  const photoFiles = getTaskPhotoFiles(req.files);
  const photoValidationError = validateTaskPhotoFiles(photoFiles);

  if (photoValidationError) {
    res.status(400).json({ message: photoValidationError });
    return;
  }

  if (parsed.data.assigneeId) {
    const assignee = await prisma.user.findFirst({ where: { id: parsed.data.assigneeId, archivedAt: null } });

    if (!assignee) {
      res.status(404).json({ message: "Исполнитель не найден." });
      return;
    }
  }

  let requestedTags: Awaited<ReturnType<typeof getProjectTagsByIds>> | null = null;

  if (parsed.data.tagIds) {
    const hasValidTags = await validateProjectTagIds(prisma, existing.projectId, parsed.data.tagIds);

    if (!hasValidTags) {
      res.status(400).json({ message: "Некорректные теги задачи." });
      return;
    }

    requestedTags = await getProjectTagsByIds(prisma, existing.projectId, parsed.data.tagIds);
  }

  const keepImageIds = parseKeepImageIds(req.body.keepImageIds);
  const imagesToDelete = keepImageIds
    ? existing.images.filter((image) => !keepImageIds.has(image.id))
    : [];

  const changes = buildTaskUpdateChanges(existing, parsed.data);
  const statusChange = buildSingleChange("status", existing.status, parsed.data.status);
  const tagsChange = requestedTags ? buildTaskTagsChange(existing.tags, requestedTags) : null;
  const photoNames = await saveTaskPhotoFiles(taskId, photoFiles);

  if (imagesToDelete.length > 0 || (photoNames && photoNames.length > 0)) {
    changes.push({
      field: "images",
      oldValue: existing.images.map((image) => image.name),
      newValue: [
        ...existing.images.filter((image) => !imagesToDelete.some((deletedImage) => deletedImage.id === image.id)).map((image) => image.name),
        ...(photoNames ?? []),
      ],
    });
  }

  const task = await prisma.$transaction(async (tx) => {
    if (imagesToDelete.length > 0) {
      await tx.taskImage.deleteMany({
        where: {
          id: { in: imagesToDelete.map((image) => image.id) },
          taskId,
        },
      });
    }

    if (photoNames && photoNames.length > 0) {
      await tx.taskImage.createMany({
        data: photoNames.map((name) => ({
          taskId,
          name,
        })),
      });
    }

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        priority: parsed.data.priority as TaskPriority | undefined,
        status: parsed.data.status as TaskStatus | undefined,
        assigneeId: parsed.data.assigneeId,
        tags: parsed.data.tagIds
          ? {
              set: toTaskTagConnections(parsed.data.tagIds),
            }
          : undefined,
      },
      select: taskDetailSelect,
    });

    if (changes.length > 0) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "TASK_UPDATED",
          changes: changes as Prisma.InputJsonValue,
        },
      });
    }

    if (statusChange) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "STATUS_UPDATED",
          changes: [statusChange] as Prisma.InputJsonValue,
        },
      });
    }

    if (tagsChange && tagsChange.length > 0) {
      await tx.taskEvent.create({
        data: {
          taskId,
          actorId: getSessionUserId(res),
          type: "TAGS_UPDATED",
          changes: tagsChange as Prisma.InputJsonValue,
        },
      });
    }

    return updatedTask;
  });

  if (imagesToDelete.length > 0) {
    await deleteTaskPhotoFiles(taskId, imagesToDelete.map((image) => image.name));
  }

  res.json(serializeTask(task));
});
