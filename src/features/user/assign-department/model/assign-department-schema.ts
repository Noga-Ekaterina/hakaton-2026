import { z } from "zod";

export const assignUserDepartmentSchema = z.object({
  departmentId: z.string().min(1, "Выберите отдел"),
});

export type AssignUserDepartmentValues = z.infer<typeof assignUserDepartmentSchema>;
