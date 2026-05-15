import type { TaskListItem, TaskSort, TaskStatus } from "@/entities/task";
import { filterTasks, sortTasks, type TaskFilters } from "@/entities/task";

export function getColumnTasks(tasks: TaskListItem[] | undefined, statuses: TaskStatus[], filters: TaskFilters, sort: TaskSort | null) {
  return sortTasks(
    filterTasks(tasks, filters).filter((task) => statuses.includes(task.status)),
    sort,
  );
}

export function getDoneTasks(tasks: TaskListItem[] | undefined, filters: TaskFilters, sort: TaskSort | null) {
  return sortTasks(
    filterTasks(tasks, filters).filter((task) => task.status === "DONE"),
    sort,
  );
}
