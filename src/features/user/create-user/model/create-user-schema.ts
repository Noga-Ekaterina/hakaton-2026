import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Имя должно быть не короче 2 символов"),
  email: z.string().trim().email("Введите корректный email"),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
  departmentId: z.string().min(1, "Выберите отдел"),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
