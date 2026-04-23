import { z } from "zod";

import { taskPrioritySchema, taskStatusSchema } from "./common.js";

const isoDateTimeSchema = z.string().datetime();

export const taskSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: isoDateTimeSchema,
  createdAt: isoDateTimeSchema,
  authorId: z.coerce.number().int().positive(),
  authorName: z.string().min(1),
  assigneeId: z.coerce.number().int().positive(),
  assigneeName: z.string().min(1),
  projectId: z.coerce.number().int().positive(),
  isOverdue: z.boolean().optional(),
});
export type Task = z.infer<typeof taskSchema>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не короче 3 символов"),
  description: z.string().trim().min(10, "Описание должно быть не короче 10 символов"),
  priority: taskPrioritySchema,
  deadline: z
    .string()
    .min(1, "Укажите дедлайн")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Укажите корректную дату")
    .refine((value) => new Date(value).getTime() > Date.now() - 60_000, "Дедлайн не может быть в прошлом"),
  assigneeId: z.coerce.number().int().positive().min(1, "Выберите исполнителя"),
  projectId: z.coerce.number().int().positive().min(1, "Выберите проект"),
});
export type CreateTaskValues = z.infer<typeof createTaskSchema>;
