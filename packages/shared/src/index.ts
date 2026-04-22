import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const taskStatusSchema = z.enum(["NEW", "IN_PROGRESS", "DONE", "BLOCKED"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const projectSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
});
export type Project = z.infer<typeof projectSchema>;

export const taskSchema = z.object({
  id: z.number().int(),
  title: z.string().min(1),
  shortDescription: z.string().min(1),
  description: z.string().optional(),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  deadline: z.string().min(1),
  createdAt: z.string().optional(),
  authorId: z.number().int().optional(),
  authorName: z.string().min(1),
  assigneeId: z.number().int(),
  assigneeName: z.string().min(1),
  projectId: z.number().int().optional(),
  isOverdue: z.boolean().optional(),
});
export type Task = z.infer<typeof taskSchema>;

export const userSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  email: z.string().email(),
  role: userRoleSchema,
  projectId: z.number().int().nullable(),
  projectName: z.string().nullable(),
  project: projectSchema.nullable().optional(),
});
export type User = z.infer<typeof userSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль").min(3, "Минимум 3 символа"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Название проекта должно быть не короче 2 символов"),
});
export type CreateProjectValues = z.infer<typeof createProjectSchema>;

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Название должно быть не короче 3 символов"),
  description: z.string().trim().min(10, "Описание должно быть не короче 10 символов"),
  priority: taskPrioritySchema,
  deadline: z
    .string()
    .min(1, "Укажите дедлайн")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Укажите корректную дату")
    .refine((value) => new Date(value).getTime() > Date.now() - 60_000, "Дедлайн не может быть в прошлом"),
  assigneeId: z.string().min(1, "Выберите исполнителя"),
  projectId: z.string().min(1, "Выберите проект"),
});
export type CreateTaskValues = z.infer<typeof createTaskSchema>;

export const userBaseSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
  email: z.string().trim().email("Введите корректный email"),
  role: userRoleSchema,
  projectId: z.string().optional(),
});
export type UserBaseValues = z.infer<typeof userBaseSchema>;

export const createUserSchema = userBaseSchema
  .extend({
    password: z.string().trim().min(6, "Минимум 6 символов"),
  })
  .superRefine((values, ctx) => {
    if (values.role === "USER" && !values.projectId) {
      ctx.addIssue({
        code: "custom",
        path: ["projectId"],
        message: "Выберите проект",
      });
    }
  });
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const assignUserProjectSchema = z.object({
  projectId: z.string().min(1, "Выберите проект"),
});
export type AssignUserProjectValues = z.infer<typeof assignUserProjectSchema>;

export const changeUserRoleSchema = z.object({
  role: userRoleSchema,
});
export type ChangeUserRoleValues = z.infer<typeof changeUserRoleSchema>;

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});
export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;

export const updateUserProjectSchema = z.object({
  projectId: z.string().min(1, "Выберите проект"),
});
export type UpdateUserProjectValues = z.infer<typeof updateUserProjectSchema>;
