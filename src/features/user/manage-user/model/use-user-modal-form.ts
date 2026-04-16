import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateUserMutation, useUpdateUserMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import type { User } from "@/entities/user";
import { createUserSchema, type CreateUserValues } from "../../create-user/model/create-user-schema";

type UseUserModalFormParams = {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  user?: User | null;
};

export function useUserModalForm({ open, onClose, departments, user }: UseUserModalFormParams) {
  const [createUser, createState] = useCreateUserMutation();
  const [updateUser, updateState] = useUpdateUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<CreateUserValues>(
    () => ({
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "EMPLOYEE",
      departmentId: user?.departmentId ? String(user.departmentId) : String(departments[0]?.id ?? ""),
    }),
    [departments, user],
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const selectedDepartmentId = watch("departmentId");

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }

    reset(defaultValues);
  }, [defaultValues, open, reset]);

  useEffect(() => {
    if (!selectedDepartmentId && departments[0]?.id) {
      setValue("departmentId", String(departments[0].id), { shouldValidate: true });
    }
  }, [departments, selectedDepartmentId, setValue]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const departmentId = Number(values.departmentId);
    const departmentName = departments.find((department) => department.id === departmentId)?.name ?? "";

    try {
      if (user) {
        await updateUser({
          id: user.id,
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          departmentId,
          departmentName,
        }).unwrap();
      } else {
        await createUser({
          name: values.name.trim(),
          email: values.email.trim(),
          role: values.role,
          departmentId,
          departmentName,
        }).unwrap();
      }

      onClose();
    } catch {
      setSubmitError(user ? "Не удалось обновить пользователя." : "Не удалось создать пользователя.");
    }
  });

  const isPending = isSubmitting || createState.isLoading || updateState.isLoading;

  return {
    register,
    errors,
    submit,
    submitError,
    isPending,
    title: user ? "Редактировать пользователя" : "Создать пользователя",
    description: "Можно изменить имя, email, роль и отдел в одном окне.",
    primaryLabel: user ? "Сохранить изменения" : "Создать пользователя",
  };
}
