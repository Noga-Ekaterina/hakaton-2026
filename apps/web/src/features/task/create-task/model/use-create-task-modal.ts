import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useCreateTaskMutation, useGetCreateTaskMetaQuery } from "@/app/store/api/tasks-api";
import { useAppSelector } from "@/app/store/hooks";
import { getUserDisplayOptions } from "@/entities/user";
import { buildCreateTaskInput, getDefaultCreateTaskValues } from "./create-task-form";
import { createTaskSchema, type CreateTaskValues } from "./create-task-schema";

type UseCreateTaskModalParams = {
  open: boolean;
};

export function useCreateTaskModal({ open }: UseCreateTaskModalParams) {
  const currentUser = useAppSelector((state) => state.auth.user);
  const { projectId } = useParams();
  const projectIdNumber = Number(projectId);
  const hasProjectId = Number.isInteger(projectIdNumber);
  const { data: meta, isLoading, isError } = useGetCreateTaskMetaQuery(projectIdNumber, { skip: !open || !hasProjectId });
  const [createTask, { isLoading: isSubmitting }] = useCreateTaskMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const assigneeOptions = useMemo(() => getUserDisplayOptions(meta?.users ?? [], currentUser?.id ?? null), [currentUser?.id, meta?.users]);

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
    watch,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      return;
    }

    setSubmitError(null);
    reset(getDefaultCreateTaskValues(meta));
  }, [meta, open, reset]);

  useEffect(() => {
    if (!open || !meta) {
      return;
    }

    if (!getValues("assigneeId")) {
      setValue("assigneeId", meta.users[0]?.id ?? 0, { shouldValidate: true });
    }
  }, [getValues, meta, open, setValue]);

  const submit = handleSubmit(async (values) => {
    if (!meta) {
      setSubmitError("Не удалось загрузить данные формы.");
      return;
    }

    if (!currentUser) {
      setSubmitError("Не удалось определить текущего пользователя.");
      return;
    }

    const input = buildCreateTaskInput(values, meta, projectIdNumber);

    if (!input) {
      setSubmitError("Не удалось определить проект из URL или выбрать исполнителя.");
      return;
    }

    try {
      await createTask({ authorId: currentUser.id, body: input }).unwrap();
      reset({
        ...getDefaultCreateTaskValues(meta),
        priority: values.priority,
        assigneeId: values.assigneeId,
      });
    } catch {
      setSubmitError("Не удалось создать задачу. Попробуйте еще раз.");
    }
  });

  return {
    meta,
    assigneeOptions,
    register,
    setValue,
    watch,
    errors,
    isLoading,
    isError,
    isSubmitting,
    submitError,
    submit,
  };
}
