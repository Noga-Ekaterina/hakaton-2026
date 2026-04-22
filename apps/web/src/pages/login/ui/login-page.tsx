import { LoginForm } from "@/features/auth/login-form";

export function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1419] text-foreground">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(192,86,33,0.35),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(20,83,45,0.12),transparent),radial-gradient(ellipse_50%_30%_at_0%_80%,rgba(192,86,33,0.08),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/25 blur-[90px]"
        aria-hidden
      />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300/90">
              Добро пожаловать
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Вход в аккаунт
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Введите email и пароль, чтобы продолжить
            </p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
