import type { CreateTaskInput, CreateTaskMeta } from "@/app/store/api/tasks-api";
import type { CreateTaskValues } from "./create-task-schema";

export function getDefaultCreateTaskValues(meta?: CreateTaskMeta): CreateTaskValues {
  return {
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: meta?.users[0]?.id ?? 0,
    photos: [],
  };
}

export function buildCreateTaskInput(values: CreateTaskValues, meta: CreateTaskMeta, projectId: number): CreateTaskInput | null {
  const assignee = meta.users.find((item) => item.id === values.assigneeId);

  if (!assignee || !Number.isInteger(projectId)) {
    return null;
  }

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    assigneeId: assignee.id,
    projectId,
    photos: values.photos,
  };
}
