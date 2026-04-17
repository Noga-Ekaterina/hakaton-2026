import { z } from "zod";

export const userBaseSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
  email: z.string().trim().email("Введите корректный email"),
  role: z.enum(["USER", "ADMIN"]),
  departmentId: z.string().optional(),
});

export const createUserSchema = userBaseSchema
  .extend({
    password: z.string().trim().min(6, "Минимум 6 символов"),
  })
  .superRefine((values, ctx) => {
    if (values.role === "USER" && !values.departmentId) {
      ctx.addIssue({
        code: "custom",
        path: ["departmentId"],
        message: "Выберите отдел",
      });
    }
  });

export type UserBaseValues = z.infer<typeof userBaseSchema>;
export type CreateUserValues = z.infer<typeof createUserSchema>;
