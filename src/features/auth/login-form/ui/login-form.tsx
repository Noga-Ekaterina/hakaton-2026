import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { loginUser } from "@/app/store/auth-slice";
import { paths } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { loginSchema, type LoginValues } from "@/features/auth/login-form/model/login-schema";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginValues) => {
    setSubmitError(null);

    try {
      const user = await dispatch(loginUser(data)).unwrap();
      navigate(user.role === "ADMIN" ? paths.adminUsers : paths.home, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.07] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="login-email" className="text-slate-200">
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            className="h-12 rounded-2xl border-white/15 bg-white/5 text-white placeholder:text-slate-500 focus:border-primary/60 focus:ring-primary/25"
          />
          {errors.email ? <p className="text-sm text-rose-400">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password" className="text-slate-200">
              Пароль
            </Label>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="********"
              {...register("password")}
              className="h-12 rounded-2xl border-white/15 bg-white/5 pr-12 text-white placeholder:text-slate-500 focus:border-primary/60 focus:ring-primary/25"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-white/10 hover:text-slate-200"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? "Скрыть" : "Показать"}
            </button>
          </div>
          {errors.password ? <p className="text-sm text-rose-400">{errors.password.message}</p> : null}
        </div>

        {submitError ? <p className="text-sm text-rose-400">{submitError}</p> : null}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-12 w-full rounded-2xl text-base font-semibold shadow-warm"
        >
          {isSubmitting ? "Входим..." : "Войти"}
        </Button>
      </form>
    </div>
  );
}
