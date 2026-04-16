import { NavLink, Outlet, useLocation } from "react-router-dom";
import { paths } from "@/shared/config/routes";

const tabClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40";

export function AdminShell() {
  const location = useLocation();
  const routeWithSearch = (pathname: string) => ({ pathname, search: location.search });

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Администрирование</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Пользователи и отделы</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Пользователи и отделы разнесены по отдельным страницам. Создание и редактирование выполняются в модальных
          окнах.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <NavLink
            to={routeWithSearch(paths.adminUsers)}
            className={({ isActive }) =>
              `${tabClass} ${isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"}`
            }
          >
            Пользователи
          </NavLink>
          <NavLink
            to={routeWithSearch(paths.adminDepartments)}
            className={({ isActive }) =>
              `${tabClass} ${isActive ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "bg-white/70 text-slate-700 hover:bg-white"}`
            }
          >
            Отделы
          </NavLink>
        </div>
      </div>

      <Outlet />
    </section>
  );
}
