import { Prisma } from "@prisma/client";
import type {
  Task,
  TaskChange,
  TaskComment,
  TaskEvent,
  TaskListItem,
  TaskPriority as SharedTaskPriority,
  TaskStatus as SharedTaskStatus,
} from "@hakaton/shared";

import { toIso } from "../../../lib/dates.js";
import { taskDetailSelect, taskListSelect } from "./taskRelations.js";

type TaskWithRelations = Prisma.TaskGetPayload<{
  select: typeof taskDetailSelect;
}>;

type TaskListItemWithRelations = Prisma.TaskGetPayload<{
  select: typeof taskListSelect;
}>;

type TaskCommentWithAuthor = Prisma.TaskCommentGetPayload<{
  include: {
    author: { select: { id: true; name: true } };
  };
}>;

type TaskEventWithActor = Prisma.TaskEventGetPayload<{
  include: {
    actor: { select: { id: true; name: true } };
  };
}>;

export function buildShortDescription(description: string) {
  const trimmed = description.trim();
  return trimmed.length <= 96 ? trimmed : `${trimmed.slice(0, 93)}...`;
}

export function serializeTask(task: TaskWithRelations): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    shortDescription: task.shortDescription,
    status: task.status as SharedTaskStatus,
    priority: task.priority as SharedTaskPriority,
    storyPoints: task.storyPoints,
    createdAt: toIso(task.createdAt),
    authorId: task.authorId,
    authorName: task.author.name,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee.name,
    projectId: task.projectId,
    images: task.images.map((image) => ({
      id: image.id,
      name: image.name,
      url: `/api/tasks/${task.id}/images/${encodeURIComponent(image.name)}`,
    })),
    tags: task.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      projectId: tag.projectId,
    })),
  };
}

export function serializeTaskListItem(task: TaskListItemWithRelations): TaskListItem {
  return {
    id: task.id,
    title: task.title,
    shortDescription: task.shortDescription,
    status: task.status as SharedTaskStatus,
    priority: task.priority as SharedTaskPriority,
    storyPoints: task.storyPoints,
    createdAt: toIso(task.createdAt),
    authorId: task.authorId,
    authorName: task.author.name,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee.name,
    projectId: task.projectId,
    images: task.images.map((image) => ({
      id: image.id,
      name: image.name,
      url: `/api/tasks/${task.id}/images/${encodeURIComponent(image.name)}`,
    })),
    tags: task.tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      projectId: tag.projectId,
    })),
  };
}

function serializeTimelineUser(user: { id: number; name: string }) {
  return {
    id: user.id,
    name: user.name,
  };
}

function serializeTaskChanges(value: Prisma.JsonValue | null): TaskChange[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const change = item as Record<string, unknown>;

      if (typeof change.field !== "string" || change.field.trim() === "") {
        return null;
      }

      return {
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      };
    })
    .filter((item): item is TaskChange => item !== null);
}

export function serializeTaskComment(comment: TaskCommentWithAuthor): TaskComment {
  return {
    kind: "comment",
    id: comment.id,
    taskId: comment.taskId,
    author: serializeTimelineUser(comment.author),
    body: comment.body,
    isDeleted: comment.isDeleted,
    editedAt: comment.editedAt ? toIso(comment.editedAt) : null,
    createdAt: toIso(comment.createdAt),
  };
}

export function serializeTaskEvent(event: TaskEventWithActor): TaskEvent {
  return {
    kind: "event",
    id: event.id,
    taskId: event.taskId,
    actor: event.actor ? serializeTimelineUser(event.actor) : null,
    type: event.type,
    changes: serializeTaskChanges(event.changes),
    metadata: event.metadata,
    createdAt: toIso(event.createdAt),
  };
}
