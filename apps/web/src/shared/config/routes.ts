export const paths = {
  home: "/",
  login: "/login",
  admin: "/admin",
  adminUsers: "/admin/users",
  projects: "/projects",
  projectDetail: "/projects/:projectId",
  projectDone: "/projects/:projectId/done",
} as const;

export type AppPathKey = keyof typeof paths;

export function projectPath(projectId: number | string) {
  return `${paths.projects}/${projectId}`;
}

export function projectDonePath(projectId: number | string) {
  return `${paths.projects}/${projectId}/done`;
}
