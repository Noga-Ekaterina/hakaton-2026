import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { AuthGate } from "@/app/auth/ui/auth-gate";
import { AppLayout } from "@/app/layout";
import { paths } from "@/shared/config/routes";
import { AdminAccessGate } from "@/pages/admin";
import { AdminDepartmentsPage } from "@/pages/admin/departments";
import { AdminUsersPage } from "@/pages/admin/users";
import { HomePage } from "@/pages/home";
import { OverduePage } from "@/pages/overdue";
import { LoginPage } from "@/pages/login";

const routeObjects: RouteObject[] = [
  {
    element: <AuthGate />,
    children: [
      {
        path: paths.login,
        element: <LoginPage />,
      },
      {
        path: paths.home,
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: "overdue",
            element: <OverduePage />,
          },
          {
            path: "admin",
            element: <AdminAccessGate />,
            children: [
              {
                index: true,
                element: <Navigate to={paths.adminUsers} replace />,
              },
              {
                path: "users",
                element: <AdminUsersPage />,
              },
              {
                path: "departments",
                element: <AdminDepartmentsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routeObjects);
