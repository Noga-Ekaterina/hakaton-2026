import { z } from "zod";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);
export type UserRole = z.infer<typeof userRoleSchema>;

export const taskStatusSchema = z.enum(["NEW", "IN_PROGRESS", "AWAITING_INSPECTION", "DONE"]);
export type TaskStatus = z.infer<typeof taskStatusSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export type TaskPriority = z.infer<typeof taskPrioritySchema>;

export const projectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
});
export type Project = z.infer<typeof projectSchema>;
