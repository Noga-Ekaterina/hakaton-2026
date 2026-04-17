import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import { createUserSchema, type CreateUserValues } from "../../create-user/model/create-user-schema";

type UseUserModalFormParams = {
  open: boolean;
  onClose: () => void;
  departments: Department[];
};

export function useUserModalForm({ open, onClose, departments }: UseUserModalFormParams) {
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
      departmentId: "",
    },
  });

  const selectedDepartmentId = watch("departmentId");
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
      departmentId: departments[0]?.id ? String(departments[0].id) : "",
    });
  }, [departments, open, reset]);

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      if (selectedDepartmentId) {
        setValue("departmentId", "", { shouldValidate: true });
      }
      return;
    }

    if (!selectedDepartmentId && departments[0]?.id) {
      setValue("departmentId", String(departments[0].id), { shouldValidate: true });
    }
  }, [departments, selectedDepartmentId, selectedRole, setValue]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);
    const departmentId = values.role === "ADMIN" ? null : Number(values.departmentId);
    const departmentName =
      values.role === "ADMIN" ? null : departments.find((department) => department.id === departmentId)?.name ?? "";

    try {
      await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        departmentId,
        departmentName,
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
    description: "Можно указать имя, email, пароль, роль и отдел в одном окне.",
    primaryLabel: "Создать пользователя",
  };
}
