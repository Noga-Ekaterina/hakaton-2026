import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const updateUserProjectSchema = z.object({
  projectId: z.string().min(1, "Выберите проект"),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserProjectValues = z.infer<typeof updateUserProjectSchema>;
