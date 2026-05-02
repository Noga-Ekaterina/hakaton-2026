import type { TaskPriority, TaskStatus } from "./types";
import { taskPriorityMeta, taskStatusMeta } from "./task-meta";

export function formatTaskTimelineDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTaskFieldLabel(field: string) {
  const labels: Record<string, string> = {
    title: "Название",
    description: "Описание",
    priority: "Приоритет",
    status: "Статус",
    assigneeId: "Исполнитель",
    storyPoints: "Story points",
    images: "Фото",
    tagsAdded: "Добавлены теги",
    tagsRemoved: "Удалены теги",
  };

  return labels[field] ?? field;
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && value in taskStatusMeta;
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && value in taskPriorityMeta;
}
