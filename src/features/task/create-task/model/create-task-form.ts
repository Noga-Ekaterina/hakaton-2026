import type { CreateTaskMeta, CreateTaskInput } from "@/app/store/api/tasks-api";
import type { CreateTaskValues } from "./create-task-schema";

export const defaultAuthor = {
  id: 1,
  name: "Иван Петров",
};

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
    shortDescription: "",
    status: "NEW",
    priority: "MEDIUM",
    deadline: getDefaultDeadline(),
    assigneeId: String(meta?.assignees[0]?.id ?? ""),
    departmentId: String(meta?.departments[0]?.id ?? ""),
  };
}

function toIsoFromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function buildCreateTaskInput(values: CreateTaskValues, meta: CreateTaskMeta): CreateTaskInput | null {
  const assignee = meta.assignees.find((item) => String(item.id) === values.assigneeId);

  if (!assignee) {
    return null;
  }

  return {
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim(),
    status: values.status,
    priority: values.priority,
    deadline: toIsoFromDateTimeLocal(values.deadline),
    authorId: defaultAuthor.id,
    authorName: defaultAuthor.name,
    assigneeId: assignee.id,
    assigneeName: assignee.name,
    departmentId: Number(values.departmentId),
    createdAt: new Date().toISOString(),
    isOverdue: values.status !== "DONE" && new Date(values.deadline).getTime() < Date.now(),
  };
}
