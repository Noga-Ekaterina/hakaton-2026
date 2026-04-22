import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProjectMutation, useUpdateProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import { createProjectSchema, type CreateProjectValues } from "../../create-project/model/create-project-schema";

type UseProjectModalFormParams = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export function useProjectModalForm({ open, onClose, project }: UseProjectModalFormParams) {
  const [createProject, createState] = useCreateProjectMutation();
  const [updateProject, updateState] = useUpdateProjectMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<CreateProjectValues>(
    () => ({
      name: project?.name ?? "",
    }),
    [project],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }

    reset(defaultValues);
  }, [defaultValues, open, reset]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      if (project) {
        await updateProject({ id: project.id, name: values.name.trim() }).unwrap();
      } else {
        await createProject({ name: values.name.trim() }).unwrap();
      }
      onClose();
    } catch {
      setSubmitError(project ? "Не удалось обновить проект." : "Не удалось создать проект.");
    }
  });

  const isPending = isSubmitting || createState.isLoading || updateState.isLoading;

  return {
    register,
    errors,
    submit,
    submitError,
    isPending,
    title: project ? "Редактировать проект" : "Создать проект",
    description: project ? "Измените название проекта и сохраните изменения." : "Добавьте новый проект в список.",
    primaryLabel: project ? "Сохранить изменения" : "Создать проект",
  };
}
