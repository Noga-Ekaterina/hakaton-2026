import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Название проекта обязательно"),
});
export type CreateProjectValues = z.infer<typeof createProjectSchema>;
