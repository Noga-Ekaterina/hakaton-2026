import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateTaskMutation, useGetCreateTaskMetaQuery } from "@/app/store/api/tasks-api";
import { buildCreateTaskInput, getDefaultCreateTaskValues } from "./create-task-form";
import { createTaskSchema, type CreateTaskValues } from "./create-task-schema";

type UseCreateTaskModalParams = {
  open: boolean;
  onClose: () => void;
};

export function useCreateTaskModal({ open, onClose }: UseCreateTaskModalParams) {
  const { data: meta, isLoading, isError } = useGetCreateTaskMetaQuery(undefined, { skip: !open });
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: getDefaultCreateTaskValues(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }

    setSubmitError(null);
    reset(getDefaultCreateTaskValues());
  }, [open, reset]);

  useEffect(() => {
    if (!open || !meta) {
      return;
    }

    if (!getValues("assigneeId")) {
      setValue("assigneeId", String(meta.assignees[0]?.id ?? ""), { shouldValidate: true });
    }

    if (!getValues("departmentId")) {
      setValue("departmentId", String(meta.departments[0]?.id ?? ""), { shouldValidate: true });
    }
  }, [getValues, meta, open, setValue]);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const submit = handleSubmit(async (values) => {
    if (!meta) {
      setSubmitError("Не удалось загрузить данные формы.");
      return;
    }

    const input = buildCreateTaskInput(values, meta);

    if (!input) {
      setSubmitError("Выберите исполнителя из списка.");
      return;
    }

    try {
      await createTask(input).unwrap();
      onClose();
    } catch {
      setSubmitError("Не удалось создать задачу. Попробуйте еще раз.");
    }
  });

  return {
    meta,
    register,
    errors,
    isLoading,
    isError,
    isSubmitting,
    submitError,
    submit,
  };
}
