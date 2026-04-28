import type { Task, TaskStatus } from "@/entities/task";
import { filterTasks, type TaskFilters } from "@/entities/task";

export function getColumnTasks(tasks: Task[] | undefined, statuses: TaskStatus[], filters: TaskFilters) {
  return filterTasks(tasks, filters).filter((task) => statuses.includes(task.status));
}

export function getDoneTasks(tasks: Task[] | undefined, filters: TaskFilters) {
  return filterTasks(tasks, filters).filter((task) => task.status === "DONE");
}
