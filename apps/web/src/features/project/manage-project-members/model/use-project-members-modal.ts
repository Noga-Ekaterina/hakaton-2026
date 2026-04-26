import { useEffect, useMemo, useState } from "react";
import { useAssignUserProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";

type UseProjectMembersModalParams = {
  open: boolean;
  project: Project;
  users: User[];
};

function isProjectMember(user: User, projectId: number) {
  return user.projects?.some((project) => project.id === projectId) ?? false;
}

export function useProjectMembersModal({ open, project, users }: UseProjectMembersModalParams) {
  const [assignUserProject, { isLoading }] = useAssignUserProjectMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  const availableUsers = useMemo(() => {
    return users.filter((user) => user.role !== "ADMIN" && !isProjectMember(user, project.id));
  }, [project.id, users]);

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setPendingUserId(null);
    }
  }, [open]);

  const addUser = async (user: User) => {
    setSubmitError(null);
    setPendingUserId(user.id);

    try {
      await assignUserProject({ id: user.id, projectId: project.id }).unwrap();
    } catch {
      setSubmitError("Не удалось добавить пользователя в проект.");
    } finally {
      setPendingUserId(null);
    }
  };

  return {
    availableUsers,
    addUser,
    isPending: isLoading || pendingUserId !== null,
    pendingUserId,
    submitError,
  };
}
