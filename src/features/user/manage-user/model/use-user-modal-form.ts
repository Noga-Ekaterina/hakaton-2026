import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import { createUserSchema, type CreateUserValues } from "../../create-user/model/create-user-schema";

type UseUserModalFormParams = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
};

export function useUserModalForm({ open, onClose, projects }: UseUserModalFormParams) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      projectId: "",
    },
  });

  const selectedProjectId = watch("projectId");
  const selectedRole = watch("role");

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }

    reset({
      name: "",
      email: "",
      password: "",
      role: "USER",
      projectId: projects[0]?.id ? String(projects[0].id) : "",
    });
  }, [open, projects, reset]);

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      if (selectedProjectId) {
        setValue("projectId", "", { shouldValidate: true });
      }
      return;
    }

    if (!selectedProjectId && projects[0]?.id) {
      setValue("projectId", String(projects[0].id), { shouldValidate: true });
    }
  }, [projects, selectedProjectId, selectedRole, setValue]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const projectId = values.role === "ADMIN" ? null : Number(values.projectId);
    const projectName = values.role === "ADMIN" ? null : projects.find((project) => project.id === projectId)?.name ?? "";

    try {
      await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        projectId,
        projectName,
      }).unwrap();

      onClose();
    } catch {
      setSubmitError("Не удалось создать пользователя.");
    }
  });

  const isPending = isSubmitting || isLoading;

  return {
    register,
    errors,
    submit,
    submitError,
    isPending,
    selectedRole,
    title: "Создать пользователя",
    description: "Можно указать имя, email, пароль, роль и проект в одном окне.",
    primaryLabel: "Создать пользователя",
  };
}
