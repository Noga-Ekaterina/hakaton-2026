import type { CreateTaskMeta, CreateTaskInput } from "@/app/store/api/tasks-api";
import type { CreateTaskValues } from "./create-task-schema";

export function getDefaultDeadline() {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(18, 0, 0, 0);

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(
    value.getMinutes(),
  )}`;
}

export function getDefaultCreateTaskValues(meta?: CreateTaskMeta): CreateTaskValues {
  return {
    title: "",
    description: "",
    priority: "MEDIUM",
    deadline: getDefaultDeadline(),
    assigneeId: String(meta?.users[0]?.id ?? ""),
    departmentId: String(meta?.departments[0]?.id ?? ""),
  };
}

function toIsoFromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function buildCreateTaskInput(values: CreateTaskValues, meta: CreateTaskMeta): CreateTaskInput | null {
  const assignee = meta.users.find((item) => String(item.id) === values.assigneeId);

  if (!assignee) {
    return null;
  }

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    deadline: toIsoFromDateTimeLocal(values.deadline),
    assigneeId: assignee.id,
    departmentId: Number(values.departmentId),
  };
}
