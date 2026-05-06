import type { TaskListItem, TaskPriority } from "./types";

export type TaskFilters = {
  priority: TaskPriority[];
  assigneeIds: string[];
  authorIds: string[];
  createdFrom: string;
  createdTo: string;
  tagIds: number[];
};

function getTaskDate(value: string) {
  const isoDateMatch = value.match(/^(\d{4}-\d{2}-\d{2})$/);

  if (isoDateMatch) {
    return isoDateMatch[1];
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

export function filterTasks(tasks: TaskListItem[] | undefined, filters: TaskFilters) {
  return (tasks ?? []).filter((task) => {
    const taskDate = getTaskDate(task.createdAt);

    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(String(task.assigneeId))) {
      return false;
    }

    if (filters.authorIds.length > 0 && !filters.authorIds.includes(String(task.authorId))) {
      return false;
    }

    if (filters.createdFrom && (!taskDate || taskDate < filters.createdFrom)) {
      return false;
    }

    if (filters.createdTo && (!taskDate || taskDate > filters.createdTo)) {
      return false;
    }

    if (filters.tagIds.length > 0 && !task.tags.some((tag) => filters.tagIds.includes(tag.id))) {
      return false;
    }

    return true;
  });
}
