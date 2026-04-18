export type UserRole = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  departmentId: number | null;
  departmentName: string | null;
  department?: Department;
};

export type Department = {
  id: number;
  name: string | null;
};