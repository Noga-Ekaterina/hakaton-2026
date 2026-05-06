import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGetCreateTaskMetaQuery } from "@/app/store/api/tasks-api";
import { useAppSelector } from "@/app/store/hooks";
import { getUserDisplayOptions } from "@/entities/user";
import { hasActiveTaskFilters } from "./task-filters";
import { getTaskPriorityOptions } from "./task-filter-options";
import { useTaskFilterActions } from "./use-task-filter-actions";
import { useTaskFilterUrlState } from "./use-task-filter-url-state";
import { useVisibleTaskFilters } from "./use-visible-task-filters";

export function useTaskFiltersPanel() {
  const { projectId } = useParams();
  const projectIdNumber = Number(projectId);
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const { data: meta } = useGetCreateTaskMetaQuery(projectIdNumber, { skip: !Number.isInteger(projectIdNumber) });
  const { filters, updateFilter, updateDateFilter, updateDateFilters, clearDateFilters, clearFilters } = useTaskFilterUrlState();
  const { renderedFilters, menuFilters, hideFilter, resetVisibleFilters } = useVisibleTaskFilters(filters);
  const userOptions = useMemo(() => getUserDisplayOptions(meta?.users ?? [], currentUserId), [currentUserId, meta?.users]);
  const priorityOptions = useMemo(() => getTaskPriorityOptions(), []);
  const actions = useTaskFilterActions({
    filters,
    hideFilter,
    resetVisibleFilters,
    updateFilter,
    updateDateFilter,
    clearDateFilters,
    clearFilters,
  });

  return {
    filters,
    renderedFilters,
    menuFilters,
    assigneeOptions: userOptions,
    authorOptions: userOptions,
    tagOptions: meta?.tags ?? [],
    priorityOptions,
    hasActiveFilters: hasActiveTaskFilters(filters),
    updateFilter,
    updateDateFilter,
    updateDateFilters,
    clearDateFilters,
    clearFilters,
    ...actions,
  };
}
