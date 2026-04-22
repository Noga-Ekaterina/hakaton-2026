import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/app/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { CreateTaskModal } from "@/features/task/create-task";
import { paths } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { TaskFiltersPanel } from "@/widgets/task-filters";

const linkBaseClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40";

export function AppLayout() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);
  const routeWithSearch = (pathname: string) => ({ pathname, search: location.search });
  const isAdminPage = location.pathname.startsWith(paths.admin);
  const shouldShowTaskFilters = location.pathname === paths.home || location.pathname === paths.overdue;

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } finally {
      navigate(paths.login, { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(192,86,33,0.16),_transparent_28%),linear-gradient(135deg,_#f8f1e7,_#f0e1c8)] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="pointer-events-none absolute left-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p
                className="text-sm font-semibold uppercase tracking-[0.35em] text-primary"
                style={{ fontFamily: '"Libre Baskerville", serif' }}
              >
                QiTask
              </p>
              <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Рабочее пространство</h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Задачи, просрочка и админские операции живут в одном приложении. Переключайтесь между разделами через
                верхнее меню.
              </p>
            </div>

            <div className="shrink-0 pt-1">
              <div className="flex flex-wrap items-center justify-end gap-3">
                {isAdminPage ? (
                  <NavLink
                    to={routeWithSearch(paths.home)}
                    end
                    className={({ isActive }) =>
                      `${linkBaseClass} ${
                        isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"
                      }`
                    }
                  >
                    Доска
                  </NavLink>
                ) : currentUser?.role === "ADMIN" ? (
                  <NavLink
                    to={paths.adminUsers}
                    className={({ isActive }) =>
                      `${linkBaseClass} ${
                        isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white/70 text-slate-700 hover:bg-white"
                      }`
                    }
                  >
                    Админка
                  </NavLink>
                ) : null}

                {currentUser ? (
                  <>
                    <div className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
                      {currentUser.name}
                    </div>
                    <Button type="button" variant="secondary" onClick={handleLogout}>
                      Выход
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse flex-wrap-reverse gap-6 border-b border-slate-200/70 pb-8 lg:flex-row lg:items-start lg:justify-between">
            {shouldShowTaskFilters ? <TaskFiltersPanel /> : null}

            {!isAdminPage ? (
              <div className="flex flex-col gap-3 pb-[0.4rem] lg:items-end">
                <nav className="flex flex-wrap gap-3">
                  <NavLink
                    to={routeWithSearch(paths.home)}
                    end
                    className={({ isActive }) =>
                      `${linkBaseClass} ${
                        isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"
                      }`
                    }
                  >
                    Доска
                  </NavLink>
                  <NavLink
                    to={routeWithSearch(paths.overdue)}
                    className={({ isActive }) =>
                      `${linkBaseClass} ${
                        isActive ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-white/70 text-slate-700 hover:bg-white"
                      }`
                    }
                  >
                    Просроченные
                  </NavLink>

                  <Button type="button" onClick={() => setIsCreateTaskOpen(true)}>
                    Создать задачу
                  </Button>
                </nav>
              </div>
            ) : null}
          </div>
        </header>

        <main className="pb-16 pt-8">
          <Outlet />
        </main>
      </div>

      <CreateTaskModal open={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
    </div>
  );
}
