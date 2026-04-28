import type { TaskFilters } from "@/entities/task";

export const taskFilterParamNames = {
  priority: "priority",
  assigneeId: "assigneeId",
} as const;

export function getTaskFilters(searchParams: URLSearchParams): TaskFilters {
  const priority = searchParams.get(taskFilterParamNames.priority);
  const normalizedPriority: TaskFilters["priority"] =
    priority === "LOW" || priority === "MEDIUM" || priority === "HIGH" || priority === "CRITICAL" ? priority : "";

  return {
    priority: normalizedPriority,
    assigneeId: searchParams.get(taskFilterParamNames.assigneeId) ?? "",
  };
}

export function hasActiveTaskFilters(filters: TaskFilters) {
  return Boolean(filters.priority || filters.assigneeId);
}

export type { TaskFilters };
