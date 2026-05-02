import type { TaskFilters } from "@/entities/task";

export const taskFilterParamNames = {
  priority: "priority",
  assigneeId: "assigneeId",
  tagIds: "tagIds",
} as const;

export function getTaskFilters(searchParams: URLSearchParams): TaskFilters {
  const priority = searchParams.get(taskFilterParamNames.priority);
  const normalizedPriority: TaskFilters["priority"] =
    priority === "LOW" || priority === "MEDIUM" || priority === "HIGH" || priority === "CRITICAL" ? priority : "";
  const tagIds = searchParams
    .getAll(taskFilterParamNames.tagIds)
    .map((tagId) => Number(tagId))
    .filter(Number.isInteger);

  return {
    priority: normalizedPriority,
    assigneeId: searchParams.get(taskFilterParamNames.assigneeId) ?? "",
    tagIds,
  };
}

export function hasActiveTaskFilters(filters: TaskFilters) {
  return Boolean(filters.priority || filters.assigneeId || filters.tagIds.length > 0);
}

export type { TaskFilters };
