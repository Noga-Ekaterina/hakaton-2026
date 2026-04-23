import { useState } from "react";
import type { Project } from "@/entities/project";
import { UserCard } from "@/entities/user";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { AssignUserProjectModal } from "@/features/user/assign-project/ui/assign-user-project-modal";
import { ChangeUserRoleModal } from "@/features/user/change-role/ui/change-user-role-modal";

type UserUpdateCardProps = {
  user: User;
  projects: Project[];
};

export function UserUpdateCard({ user, projects }: UserUpdateCardProps) {
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  return (
    <>
      <UserCard user={user}>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => setIsRoleOpen(true)}>
            Изменить роль
          </Button>
          {user.role === "ADMIN" ? null : (
            <Button type="button" variant="secondary" onClick={() => setIsProjectOpen(true)}>
              Добавить проект
            </Button>
          )}
        </div>
      </UserCard>

      <ChangeUserRoleModal open={isRoleOpen} onClose={() => setIsRoleOpen(false)} user={user} />
      {user.role === "ADMIN" ? null : (
        <AssignUserProjectModal
          open={isProjectOpen}
          onClose={() => setIsProjectOpen(false)}
          user={user}
          projects={projects}
        />
      )}
    </>
  );
}
