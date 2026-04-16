import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль").min(3, "Минимум 3 символов"),
});

export type LoginValues = z.infer<typeof loginSchema>;
