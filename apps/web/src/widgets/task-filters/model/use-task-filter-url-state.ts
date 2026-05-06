import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { TaskFilters } from "@/entities/task";
import { getTaskFilters, taskFilterParamNames, type TaskArrayFilterParamName } from "./task-filters";

export function useTaskFilterUrlState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.toString();
  const filters = useMemo<TaskFilters>(() => getTaskFilters(searchParams), [search, searchParams]);

  const updateFilter = (key: TaskArrayFilterParamName, value: string[] | number[]) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames[key]);
    value.forEach((item) => nextSearchParams.append(taskFilterParamNames[key], String(item)));

    setSearchParams(nextSearchParams, { replace: true });
  };

  const updateDateFilter = (key: "createdFrom" | "createdTo", value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames[key]);
    if (value) {
      nextSearchParams.set(taskFilterParamNames[key], value);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const updateDateFilters = (createdFrom: string, createdTo: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames.createdFrom);
    nextSearchParams.delete(taskFilterParamNames.createdTo);

    if (createdFrom) {
      nextSearchParams.set(taskFilterParamNames.createdFrom, createdFrom);
    }
    if (createdTo) {
      nextSearchParams.set(taskFilterParamNames.createdTo, createdTo);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const clearDateFilters = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames.createdFrom);
    nextSearchParams.delete(taskFilterParamNames.createdTo);

    setSearchParams(nextSearchParams, { replace: true });
  };

  const clearFilters = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames.priority);
    nextSearchParams.delete(taskFilterParamNames.assigneeId);
    nextSearchParams.delete(taskFilterParamNames.authorId);
    nextSearchParams.delete(taskFilterParamNames.createdFrom);
    nextSearchParams.delete(taskFilterParamNames.createdTo);
    nextSearchParams.delete(taskFilterParamNames.tagIds);

    setSearchParams(nextSearchParams, { replace: true });
  };

  return {
    filters,
    updateFilter,
    updateDateFilter,
    updateDateFilters,
    clearDateFilters,
    clearFilters,
  };
}
