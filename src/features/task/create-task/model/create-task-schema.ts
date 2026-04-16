import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не короче 3 символов"),
  shortDescription: z.string().trim().min(10, "Описание должно быть не короче 10 символов"),
  status: z.enum(["NEW", "IN_PROGRESS", "BLOCKED", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  deadline: z
    .string()
    .min(1, "Укажите дедлайн")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Укажите корректную дату")
    .refine((value) => new Date(value).getTime() > Date.now() - 60_000, "Дедлайн не может быть в прошлом"),
  assigneeId: z.string().min(1, "Выберите исполнителя"),
  departmentId: z.string().min(1, "Выберите подразделение"),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
