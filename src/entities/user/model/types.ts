export type UserRole = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  projectId: number | null;
  projectName: string | null;
  project?: Project;
};

export type Project = {
  id: number;
  name: string | null;
};
