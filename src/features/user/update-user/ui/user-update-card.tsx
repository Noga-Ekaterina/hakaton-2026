import { useState } from "react";
import type { Department } from "@/entities/department";
import { UserCard } from "@/entities/user";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { AssignUserDepartmentModal } from "@/features/user/assign-department/ui/assign-user-department-modal";
import { ChangeUserRoleModal } from "@/features/user/change-role/ui/change-user-role-modal";

type UserUpdateCardProps = {
  user: User;
  departments: Department[];
};

export function UserUpdateCard({ user, departments }: UserUpdateCardProps) {
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

  return (
    <>
      <UserCard user={user}>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsRoleOpen(true)}>
            Изменить роль
          </Button>
          {user.role === "ADMIN" ? null : (
            <Button type="button" variant="secondary" onClick={() => setIsDepartmentOpen(true)}>
              Изменить отдел
            </Button>
          )}
        </div>
      </UserCard>

      <ChangeUserRoleModal open={isRoleOpen} onClose={() => setIsRoleOpen(false)} user={user} />
      {user.role === "ADMIN" ? null : (
        <AssignUserDepartmentModal
          open={isDepartmentOpen}
          onClose={() => setIsDepartmentOpen(false)}
          user={user}
          departments={departments}
        />
      )}
    </>
  );
}
