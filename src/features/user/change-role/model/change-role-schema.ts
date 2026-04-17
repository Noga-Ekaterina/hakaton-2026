import { z } from "zod";

export const changeUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

export type ChangeUserRoleValues = z.infer<typeof changeUserRoleSchema>;
