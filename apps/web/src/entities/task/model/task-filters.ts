import type { Task, TaskPriority } from "./types";

export type TaskFilters = {
  priority: TaskPriority | "";
  assigneeId: string;
  tagIds: number[];
};

export function filterTasks(tasks: Task[] | undefined, filters: TaskFilters) {
  return (tasks ?? []).filter((task) => {
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    if (filters.assigneeId && String(task.assigneeId) !== filters.assigneeId) {
      return false;
    }

    if (filters.tagIds.length > 0 && !task.tags.some((tag) => filters.tagIds.includes(tag.id))) {
      return false;
    }

    return true;
  });
}
