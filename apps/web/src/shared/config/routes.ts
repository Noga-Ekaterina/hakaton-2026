export const paths = {
  home: "/",
  overdue: "/overdue",
  login: "/login",
  admin: "/admin",
  adminUsers: "/admin/users",
  projects: "/projects",
  projectDetail: "/projects/:projectId",
  projectOverdue: "/projects/:projectId/overdue",
} as const;

export type AppPathKey = keyof typeof paths;

export function projectPath(projectId: number | string) {
  return `${paths.projects}/${projectId}`;
}

export function projectOverduePath(projectId: number | string) {
  return `${paths.projects}/${projectId}/overdue`;
}
