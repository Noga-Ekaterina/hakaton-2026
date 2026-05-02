import { z } from "zod";

import { taskPrioritySchema, taskStatusSchema } from "./common.js";

const isoDateTimeSchema = z.string().datetime();

export const taskImageSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  url: z.string().min(1),
});

export const taskTagSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(40),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  projectId: z.number().int().positive(),
});
export type TaskTag = z.infer<typeof taskTagSchema>;

export const taskEventTypeSchema = z.enum(["TASK_CREATED", "TASK_UPDATED", "STATUS_UPDATED", "STORY_POINTS_UPDATED", "TAGS_UPDATED"]);
export type TaskEventType = z.infer<typeof taskEventTypeSchema>;

export const taskTimelineUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});

export const taskChangeSchema = z.object({
  field: z.string().min(1),
  oldValue: z.any(),
  newValue: z.any(),
});
export type TaskChange = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
};

export const taskCommentSchema = z.object({
  kind: z.literal("comment"),
  id: z.number().int().positive(),
  taskId: z.number().int().positive(),
  author: taskTimelineUserSchema,
  body: z.string(),
  isDeleted: z.boolean(),
  editedAt: isoDateTimeSchema.nullable(),
  createdAt: isoDateTimeSchema,
});
export type TaskComment = z.infer<typeof taskCommentSchema>;

export const taskEventSchema = z.object({
  kind: z.literal("event"),
  id: z.number().int().positive(),
  taskId: z.number().int().positive(),
  actor: taskTimelineUserSchema.nullable(),
  type: taskEventTypeSchema,
  changes: z.array(taskChangeSchema),
  metadata: z.unknown().nullable(),
  createdAt: isoDateTimeSchema,
});
export type TaskEvent = {
  kind: "event";
  id: number;
  taskId: number;
  actor: z.infer<typeof taskTimelineUserSchema> | null;
  type: TaskEventType;
  changes: TaskChange[];
  metadata: unknown | null;
  createdAt: string;
};

export const taskTimelineItemSchema = z.discriminatedUnion("kind", [taskCommentSchema, taskEventSchema]);
export type TaskTimelineItem = TaskComment | TaskEvent;

export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string(),
  shortDescription: z.string(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  storyPoints: z.number().int().positive().nullable(),
  createdAt: isoDateTimeSchema,
  authorId: z.coerce.number().int().positive(),
  authorName: z.string().min(1),
  assigneeId: z.coerce.number().int().positive(),
  assigneeName: z.string().min(1),
  projectId: z.coerce.number().int().positive(),
  images: z.array(taskImageSchema),
  tags: z.array(taskTagSchema),
});
export type Task = z.infer<typeof taskSchema>;
export const taskListItemSchema = taskSchema.pick({
  id: true,
  title: true,
  shortDescription: true,
  status: true,
  priority: true,
  createdAt: true,
  authorId: true,
  authorName: true,
  assigneeId: true,
  assigneeName: true,
  projectId: true,
  images: true,
  tags: true,
});
export type TaskListItem = z.infer<typeof taskListItemSchema>;

function normalizeTagIds(value: unknown) {
  if (typeof value === "undefined" || value === null || value === "") {
    return [];
  }

  return Array.isArray(value) ? value.filter((item) => item !== "") : [value];
}

export const taskTagIdsSchema = z.preprocess(normalizeTagIds, z.array(z.coerce.number().int().positive()));

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не короче 3 символов"),
  description: z.string().trim(),
  priority: taskPrioritySchema,
  assigneeId: z.coerce.number().int().positive().min(1, "Выберите исполнителя"),
  tagIds: taskTagIdsSchema.default([]),
});

export const createTaskServerSchema = createTaskSchema.extend({
  authorId: z.coerce.number().int().positive().min(1, "Укажите автора"),
  projectId: z.coerce.number().int().positive().min(1, "Укажите проект"),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;

const nullableStoryPointsSchema = z.preprocess(
  (value) => (value === "" || value === null || typeof value === "undefined" ? null : value),
  z.coerce.number().int().positive().nullable(),
);

export const updateTaskServerSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  assigneeId: z.coerce.number().int().positive().optional(),
  storyPoints: nullableStoryPointsSchema.optional(),
  tagIds: taskTagIdsSchema.optional(),
});

export const taskTagInputSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/).default("#64748b"),
});

export const createTaskCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});
export type CreateTaskCommentValues = z.infer<typeof createTaskCommentSchema>;
