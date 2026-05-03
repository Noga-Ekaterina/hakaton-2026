import { taskPriorityMeta, taskPriorityValues } from "@/entities/task";

export function getTaskPriorityOptions() {
  return taskPriorityValues.map((priority) => ({
    value: priority,
    label: taskPriorityMeta[priority].label,
    color: taskPriorityMeta[priority].color,
  }));
}
