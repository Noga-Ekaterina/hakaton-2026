import { z } from "zod";

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Название отдела должно быть не короче 2 символов"),
});

export type CreateDepartmentValues = z.infer<typeof createDepartmentSchema>;

