export const paths = {
  home: "/",
  overdue: "/overdue",
  login: "/login",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminDepartments: "/admin/departments",
} as const;

export type AppPathKey = keyof typeof paths;
