import { z } from "zod";

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export const updateUserDepartmentSchema = z.object({
  departmentId: z.string().min(1, "Выберите отдел"),
});

export type UpdateUserRoleValues = z.infer<typeof updateUserRoleSchema>;
export type UpdateUserDepartmentValues = z.infer<typeof updateUserDepartmentSchema>;
