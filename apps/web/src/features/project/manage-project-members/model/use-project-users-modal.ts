import { useEffect, useMemo, useState } from "react";
import { useRemoveUserProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";

type UseProjectUsersModalParams = {
  open: boolean;
  project: Project;
  users: User[];
};

export function useProjectUsersModal({ open, project, users }: UseProjectUsersModalParams) {
  const [removeUserProject, { isLoading }] = useRemoveUserProjectMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const projectUsers = useMemo(() => {
    return users.filter((user) => user.role === "ADMIN" || user.projects?.some((item) => item.id === project.id));
  }, [project.id, users]);

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setPendingUserId(null);
    }
  }, [open]);

  const removeUser = async (user: User) => {
    setSubmitError(null);
    setPendingUserId(user.id);

    try {
      await removeUserProject({ id: user.id, projectId: project.id }).unwrap();
    } catch {
      setSubmitError("Не удалось удалить пользователя из проекта.");
    } finally {
      setPendingUserId(null);
    }
  };

  return {
    projectUsers,
    removeUser,
    isPending: isLoading || pendingUserId !== null,
    pendingUserId,
    submitError,
  };
}
