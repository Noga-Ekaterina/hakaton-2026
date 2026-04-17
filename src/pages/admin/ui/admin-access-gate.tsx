import { useAppSelector } from "@/app/store/hooks";
import { AdminShell } from "./admin-shell";

export function AdminAccessGate() {
  const user = useAppSelector((state) => state.auth.user);

  if (user?.role !== "ADMIN") {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md rounded-[2rem] border border-rose-200 bg-rose-50 px-8 py-10 text-center shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">Доступ закрыт</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">У вас нет прав</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Этот раздел доступен только администраторам. Если вы считаете, что это ошибка, обратитесь к
            администратору системы.
          </p>
        </div>
      </section>
    );
  }

  return <AdminShell />;
}
