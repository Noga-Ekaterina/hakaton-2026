import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchCurrentUser } from "@/app/store/auth-slice";
import { paths } from "@/shared/config/routes";

function getDashboardPath(role: "USER" | "ADMIN") {
  return role === "ADMIN" ? paths.adminUsers : paths.home;
}

function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1419] text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300">
        Проверяем авторизацию...
      </div>
    </div>
  );
}

export function AuthGate() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === "idle" && !user) {
      void dispatch(fetchCurrentUser());
    }
  }, [dispatch, status, user]);

  if (status === "idle" || status === "checking") {
    return <AuthLoader />;
  }

  if (!user && location.pathname !== paths.login) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  if (user && location.pathname === paths.login) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
}

