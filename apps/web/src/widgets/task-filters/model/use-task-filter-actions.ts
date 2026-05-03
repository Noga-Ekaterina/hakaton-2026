import type { TaskFilters } from "@/entities/task";
import type { TaskFilterKey } from "./task-filter-keys";
import type { TaskArrayFilterParamName } from "./task-filters";

type UseTaskFilterActionsParams = {
  filters: TaskFilters;
  hideFilter: (filter: TaskFilterKey) => void;
  resetVisibleFilters: () => void;
  updateFilter: (key: TaskArrayFilterParamName, value: string[] | number[]) => void;
  updateDateFilter: (key: "createdFrom" | "createdTo", value: string) => void;
  clearDateFilters: () => void;
  clearFilters: () => void;
};

export type TaskArrayFilterKey = Exclude<TaskFilterKey, "date">;

const arrayFilterParamByKey: Record<TaskArrayFilterKey, TaskArrayFilterParamName> = {
  priority: "priority",
  assignee: "assigneeId",
  author: "authorId",
  tags: "tagIds",
};

export function useTaskFilterActions({
  filters,
  hideFilter,
  resetVisibleFilters,
  updateFilter,
  updateDateFilter,
  clearDateFilters,
  clearFilters,
}: UseTaskFilterActionsParams) {
  const removeArrayFilter = (filter: TaskArrayFilterKey) => {
    updateFilter(arrayFilterParamByKey[filter], []);
    hideFilter(filter);
  };

  const updateArrayFilter = (filter: TaskArrayFilterKey, value: string[] | number[]) => {
    updateFilter(arrayFilterParamByKey[filter], value);
    if (value.length === 0) {
      hideFilter(filter);
    }
  };

  const updateVisibleDateFilter = (key: "createdFrom" | "createdTo", value: string) => {
    updateDateFilter(key, value);

    const nextCreatedFrom = key === "createdFrom" ? value : filters.createdFrom;
    const nextCreatedTo = key === "createdTo" ? value : filters.createdTo;

    if (!nextCreatedFrom && !nextCreatedTo) {
      hideFilter("date");
    }
  };

  const removeFilter = (filter: TaskFilterKey) => {
    if (filter === "date") {
      clearDateFilters();
      hideFilter("date");
      return;
    }

    removeArrayFilter(filter);
  };

  const resetFilters = () => {
    clearFilters();
    resetVisibleFilters();
  };

  return {
    removeFilter,
    updateArrayFilter,
    updateVisibleDateFilter,
    resetFilters,
  };
}
