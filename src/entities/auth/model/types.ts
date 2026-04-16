export type AuthUserRole = "USER" | "ADMIN";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthUserRole;
  departmentId: number | null;
  departmentName: string | null;
};

