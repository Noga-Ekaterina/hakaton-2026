import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useChangeUserRoleMutation } from "@/app/store/api/admin-api";
import type { User } from "@/entities/user";
import { changeUserRoleSchema, type ChangeUserRoleValues } from "./change-role-schema";

type UseChangeUserRoleFormParams = {
  user: User;
  onClose: () => void;
};

export function useChangeUserRoleForm({ user, onClose }: UseChangeUserRoleFormParams) {
  const [changeUserRole, { isLoading }] = useChangeUserRoleMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangeUserRoleValues>({
    resolver: zodResolver(changeUserRoleSchema),
    defaultValues: { role: user.role },
  });

  useEffect(() => {
    reset({ role: user.role });
  }, [reset, user.role]);

  const submit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await changeUserRole({
        id: user.id,
        role: values.role,
      }).unwrap();
      onClose();
    } catch {
      setSubmitError("Не удалось изменить роль пользователя.");
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
