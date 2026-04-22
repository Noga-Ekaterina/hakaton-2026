export const paths = {
  home: "/",
  overdue: "/overdue",
  login: "/login",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminProjects: "/admin/projects",
} as const;

export type AppPathKey = keyof typeof paths;
