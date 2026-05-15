import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { logout } from "@/app/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { paths } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

const linkBaseClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40";

export function AppLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useAppSelector((state) => state.auth.user);

  const routeWithSearch = (pathname: string) => ({ pathname, search: location.search });

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
          <div className="flex items-baseline justify-between gap-4">
            <div className="max-w-3xl">
              <p
                className="text-sm font-semibold uppercase tracking-[0.35em] text-primary"
                style={{ fontFamily: '"Libre Baskerville", serif' }}
              >
                QiTask
              </p>
            </div>

            <div className="shrink-0 pt-1">
              <div className="flex flex-wrap items-center justify-end gap-3">
                {currentUser?.role === "ADMIN" ? (
                  <NavLink
                    to={paths.adminUsers}
                    className={({ isActive }) =>
                      `${linkBaseClass} ${
                        isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"
                      }`
                    }
                  >
                    Админка
                  </NavLink>
                ) : null}

                <NavLink
                  to={routeWithSearch(paths.home)}
                  end
                  className={({ isActive }) =>
                    `${linkBaseClass} ${
                      isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"
                    }`
                  }
                >
                  Проекты
                </NavLink>

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
        </header>

        <main className="pb-16 pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
