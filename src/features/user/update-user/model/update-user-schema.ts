import { z } from "zod";

export const updateUserSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"]),
  departmentId: z.string().min(1, "Выберите отдел"),
});

export type UpdateUserValues = z.infer<typeof updateUserSchema>;
