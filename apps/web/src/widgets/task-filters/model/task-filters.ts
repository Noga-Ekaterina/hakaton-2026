import { taskPriorityValues, type TaskFilters } from "@/entities/task";

export const taskFilterParamNames = {
  priority: "priority",
  assigneeId: "assigneeId",
  authorId: "authorId",
  createdFrom: "createdFrom",
  createdTo: "createdTo",
  tagIds: "tagIds",
} as const;

export type TaskArrayFilterParamName = "priority" | "assigneeId" | "authorId" | "tagIds";

function getDateParam(searchParams: URLSearchParams, key: "createdFrom" | "createdTo") {
  const value = searchParams.get(taskFilterParamNames[key]) ?? "";

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export function getTaskFilters(searchParams: URLSearchParams): TaskFilters {
  const priority = searchParams
    .getAll(taskFilterParamNames.priority)
    .filter((value): value is TaskFilters["priority"][number] => taskPriorityValues.includes(value as TaskFilters["priority"][number]));
  const tagIds = searchParams
    .getAll(taskFilterParamNames.tagIds)
    .map((tagId) => Number(tagId))
    .filter(Number.isInteger);

  return {
    priority,
    assigneeIds: searchParams.getAll(taskFilterParamNames.assigneeId),
    authorIds: searchParams.getAll(taskFilterParamNames.authorId),
    createdFrom: getDateParam(searchParams, "createdFrom"),
    createdTo: getDateParam(searchParams, "createdTo"),
    tagIds,
  };
}

export function hasActiveTaskFilters(filters: TaskFilters) {
  return (
    filters.priority.length > 0 ||
    filters.assigneeIds.length > 0 ||
    filters.authorIds.length > 0 ||
    Boolean(filters.createdFrom) ||
    Boolean(filters.createdTo) ||
    filters.tagIds.length > 0
  );
}

export type { TaskFilters };
