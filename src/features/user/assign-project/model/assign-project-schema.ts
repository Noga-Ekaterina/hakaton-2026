import { z } from "zod";

export const assignUserProjectSchema = z.object({
  projectId: z.string().min(1, "Выберите проект"),
});

export type AssignUserProjectValues = z.infer<typeof assignUserProjectSchema>;
