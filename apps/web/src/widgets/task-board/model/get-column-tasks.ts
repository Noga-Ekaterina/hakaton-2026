import type { TaskListItem, TaskStatus } from "@/entities/task";
import { filterTasks, type TaskFilters } from "@/entities/task";

export function getColumnTasks(tasks: TaskListItem[] | undefined, statuses: TaskStatus[], filters: TaskFilters) {
  return filterTasks(tasks, filters).filter((task) => statuses.includes(task.status));
}

export function getDoneTasks(tasks: TaskListItem[] | undefined, filters: TaskFilters) {
  return filterTasks(tasks, filters).filter((task) => task.status === "DONE");
}
