import { useEffect, useMemo, useState } from "react";
import { useAssignUserProjectMutation, useRemoveUserProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";

type PendingAction = {
  type: "add" | "remove";
  projectId: number;
} | null;

type PendingActionType = Exclude<PendingAction, null>["type"];

type UseUserProjectsModalParams = {
  open: boolean;
  user: User;
  projects: Project[];
};

export function useUserProjectsModal({ open, user, projects }: UseUserProjectsModalParams) {
  const [assignUserProject] = useAssignUserProjectMutation();
  const [removeUserProject] = useRemoveUserProjectMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const assignedProjects = useMemo(() => user.projects ?? [], [user.projects]);

  const availableProjects = useMemo(() => {
    const assignedProjectIds = new Set(assignedProjects.map((project) => project.id));
    return projects.filter((project) => !assignedProjectIds.has(project.id));
  }, [assignedProjects, projects]);

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setPendingAction(null);
    }
  }, [open]);

  const addProject = async (project: Project) => {
    setSubmitError(null);
    setPendingAction({ type: "add", projectId: project.id });

    try {
      await assignUserProject({ id: user.id, projectId: project.id }).unwrap();
    } catch {
      setSubmitError("Не удалось добавить проект пользователю.");
    } finally {
      setPendingAction(null);
    }
  };

  const removeProject = async (project: Project) => {
    setSubmitError(null);
    setPendingAction({ type: "remove", projectId: project.id });

    try {
      await removeUserProject({ id: user.id, projectId: project.id }).unwrap();
    } catch {
      setSubmitError("Не удалось удалить проект у пользователя.");
    } finally {
      setPendingAction(null);
    }
  };

  const isProjectPending = (projectId: number, type: PendingActionType) => {
    return pendingAction?.type === type && pendingAction.projectId === projectId;
  };

  return {
    assignedProjects,
    availableProjects,
    addProject,
    removeProject,
    isProjectPending,
    submitError,
  };
}
