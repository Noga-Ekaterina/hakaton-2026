import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAssignUserDepartmentMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import type { User } from "@/entities/user";
import {
  assignUserDepartmentSchema,
  type AssignUserDepartmentValues,
} from "./assign-department-schema";

type UseAssignUserDepartmentFormParams = {
  user: User;
  departments: Department[];
  onClose: () => void;
};

export function useAssignUserDepartmentForm({ user, departments, onClose }: UseAssignUserDepartmentFormParams) {
  const [assignUserDepartment, { isLoading }] = useAssignUserDepartmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignUserDepartmentValues>({
    resolver: zodResolver(assignUserDepartmentSchema),
    defaultValues: {
      departmentId: user.departmentId != null ? String(user.departmentId) : String(departments[0]?.id ?? ""),
    },
  });

  useEffect(() => {
    reset({
      departmentId: user.departmentId != null ? String(user.departmentId) : String(departments[0]?.id ?? ""),
    });
  }, [departments, reset, user.departmentId]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await assignUserDepartment({
        id: user.id,
        departmentId: Number(values.departmentId),
      }).unwrap();
      onClose();
    } catch {
      setSubmitError("Не удалось изменить отдел пользователя.");
    }
  });

  return {
    register,
    errors,
    submit,
    submitError,
    isPending: isSubmitting || isLoading,
  };
}
