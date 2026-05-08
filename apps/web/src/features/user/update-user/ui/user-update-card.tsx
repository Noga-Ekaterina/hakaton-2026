import { useState } from "react";
import { useAppSelector } from "@/app/store/hooks";
import type { Project } from "@/entities/project";
import { UserCard } from "@/entities/user";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { ChangeUserRoleModal } from "@/features/user/change-role";
import { DeleteUserModal } from "@/features/user/delete-user";
import { UserProjectsModal } from "@/features/user/manage-projects";
import { RestoreUserModal } from "@/features/user/restore-user";

type UserUpdateCardProps = {
  user: User;
  projects: Project[];
  mode?: "active" | "archived";
};

export function UserUpdateCard({ mode = "active", user, projects }: UserUpdateCardProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const isCurrentUser = currentUserId === user.id;

  return (
    <>
      <UserCard user={user}>
        <div className="flex flex-wrap gap-3">
          {mode === "active" ? (
            <>
              <Button type="button" variant="secondary" onClick={() => setIsRoleOpen(true)}>
                Изменить роль
              </Button>
              {user.role === "ADMIN" ? null : (
                <Button type="button" variant="secondary" onClick={() => setIsProjectOpen(true)}>
                  Проекты
                </Button>
              )}
              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                disabled={isCurrentUser}
                title={isCurrentUser ? "Нельзя удалить свой аккаунт" : undefined}
                onClick={() => setIsDeleteOpen(true)}
              >
                Удалить
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsRestoreOpen(true)}>
              Восстановить
            </Button>
          )}
        </div>
      </UserCard>

      <ChangeUserRoleModal open={isRoleOpen} onClose={() => setIsRoleOpen(false)} user={user} />
      <DeleteUserModal open={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} user={user} />
      <RestoreUserModal open={isRestoreOpen} onClose={() => setIsRestoreOpen(false)} user={user} />
      {user.role === "ADMIN" ? null : (
        <UserProjectsModal
          open={isProjectOpen}
          onClose={() => setIsProjectOpen(false)}
          user={user}
          projects={projects}
        />
      )}
    </>
  );
}
