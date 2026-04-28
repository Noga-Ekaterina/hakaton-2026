import { z } from "zod";

import { taskPrioritySchema, taskStatusSchema } from "./common.js";

const isoDateTimeSchema = z.string().datetime();

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
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не короче 3 символов"),
  description: z.string().trim(),
  priority: taskPrioritySchema,
  assigneeId: z.coerce.number().int().positive().min(1, "Выберите исполнителя"),
});

export const createTaskServerSchema = createTaskSchema.extend({
  authorId: z.coerce.number().int().positive().min(1, "Укажите автора"),
  projectId: z.coerce.number().int().positive().min(1, "Укажите проект"),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
