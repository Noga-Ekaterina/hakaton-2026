import { createTaskSchema as baseCreateTaskSchema } from "@hakaton/shared";
import { z } from "zod";

export const createTaskSchema = baseCreateTaskSchema.extend({
  photos: z.array(z.instanceof(File)).default([]),
});

export type CreateTaskValues = z.infer<typeof createTaskSchema>;
