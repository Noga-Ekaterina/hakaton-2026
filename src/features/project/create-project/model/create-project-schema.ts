import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Название проекта должно быть не короче 2 символов"),
});

export type CreateProjectValues = z.infer<typeof createProjectSchema>;
