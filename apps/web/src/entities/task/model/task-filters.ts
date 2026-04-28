import type { Task, TaskPriority } from "./types";

export type TaskFilters = {
  priority: TaskPriority | "";
  assigneeId: string;
};

export function filterTasks(tasks: Task[] | undefined, filters: TaskFilters) {
  return (tasks ?? []).filter((task) => {
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }

    if (filters.assigneeId && String(task.assigneeId) !== filters.assigneeId) {
      return false;
    }

    return true;
  });
}
