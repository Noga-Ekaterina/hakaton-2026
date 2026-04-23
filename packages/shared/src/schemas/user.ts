import { z } from "zod";

import { projectSchema, userRoleSchema } from "./common.js";

export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  role: userRoleSchema,
  projectId: z.number().int().positive().nullable().optional(),
  projectName: z.string().nullable().optional(),
  projects: projectSchema.array().optional(),
});
export type User = z.infer<typeof userSchema>;

export const userBaseSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
  email: z.string().trim().email("Введите корректный email"),
  role: userRoleSchema,
});
export type UserBaseValues = z.infer<typeof userBaseSchema>;

export const createUserSchema = userBaseSchema.extend({
  password: z.string().trim().min(6, "Минимум 6 символов"),
  projectId: z.string().optional(),
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
