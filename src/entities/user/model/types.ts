export type UserRole = "MANAGER" | "EMPLOYEE";

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  departmentId: number;
  departmentName: string;
};
