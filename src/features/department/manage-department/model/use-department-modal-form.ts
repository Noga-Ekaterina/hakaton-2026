import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateDepartmentMutation, useUpdateDepartmentMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import { createDepartmentSchema, type CreateDepartmentValues } from "../../create-department/model/create-department-schema";

type UseDepartmentModalFormParams = {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
};

export function useDepartmentModalForm({ open, onClose, department }: UseDepartmentModalFormParams) {
  const [createDepartment, createState] = useCreateDepartmentMutation();
  const [updateDepartment, updateState] = useUpdateDepartmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo<CreateDepartmentValues>(
    () => ({
      name: department?.name ?? "",
    }),
    [department],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDepartmentValues>({
    resolver: zodResolver(createDepartmentSchema),
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
      if (department) {
        await updateDepartment({ id: department.id, name: values.name.trim() }).unwrap();
      } else {
        await createDepartment({ name: values.name.trim() }).unwrap();
      }

      onClose();
    } catch {
      setSubmitError(department ? "Не удалось обновить отдел." : "Не удалось создать отдел.");
    }
  });

  const isPending = isSubmitting || createState.isLoading || updateState.isLoading;

  return {
    register,
    errors,
    submit,
    submitError,
    isPending,
    title: department ? "Редактировать отдел" : "Создать отдел",
    description: "Название отдела используется в списках пользователей и задач.",
    primaryLabel: department ? "Сохранить изменения" : "Создать отдел",
  };
}
