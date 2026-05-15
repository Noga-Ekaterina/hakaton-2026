import { taskPriorityValues, type TaskFilters, type TaskSort, type TaskSortDirection, type TaskSortField } from "@/entities/task";

export const taskFilterParamNames = {
  priority: "priority",
  assigneeId: "assigneeId",
  authorId: "authorId",
  createdFrom: "createdFrom",
  createdTo: "createdTo",
  tagIds: "tagIds",
  sortField: "sortField",
  sortDirection: "sortDirection",
} as const;

export type TaskArrayFilterParamName = "priority" | "assigneeId" | "authorId" | "tagIds";

const taskSortFields = ["createdAt", "priority"] as const satisfies readonly TaskSortField[];
const taskSortDirections = ["asc", "desc"] as const satisfies readonly TaskSortDirection[];
const defaultTaskSort = {
  field: "createdAt",
  direction: "desc",
} as const satisfies TaskSort;

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

export function getTaskSort(searchParams: URLSearchParams): TaskSort | null {
  const field = searchParams.get(taskFilterParamNames.sortField);
  const direction = searchParams.get(taskFilterParamNames.sortDirection);

  if (
    taskSortFields.includes(field as TaskSortField) &&
    taskSortDirections.includes(direction as TaskSortDirection)
  ) {
    return {
      field: field as TaskSortField,
      direction: direction as TaskSortDirection,
    };
  }

  return defaultTaskSort;
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
