import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAssignUserProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";
import { assignUserProjectSchema, type AssignUserProjectValues } from "./assign-project-schema";

type UseAssignUserProjectFormParams = {
  user: User;
  projects: Project[];
  onClose: () => void;
};

export function useAssignUserProjectForm({ user, projects, onClose }: UseAssignUserProjectFormParams) {
  const [assignUserProject, { isLoading }] = useAssignUserProjectMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const availableProjects = useMemo(() => {
    const assignedProjectIds = new Set(user.projects?.map((project) => project.id) ?? []);
    return projects.filter((project) => !assignedProjectIds.has(project.id));
  }, [projects, user.projects]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignUserProjectValues>({
    resolver: zodResolver(assignUserProjectSchema),
    defaultValues: {
      projectId: String(availableProjects[0]?.id ?? ""),
    },
  });

  useEffect(() => {
    reset({
      projectId: String(availableProjects[0]?.id ?? ""),
    });
  }, [availableProjects, reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await assignUserProject({
        id: user.id,
        projectId: Number(values.projectId),
      }).unwrap();
      onClose();
    } catch {
      setSubmitError("Не удалось изменить проект пользователя.");
    }
  });

  return {
    register,
    errors,
    submit,
    submitError,
    isPending: isSubmitting || isLoading,
    availableProjects,
  };
}
