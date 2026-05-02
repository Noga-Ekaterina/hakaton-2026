import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useGetCreateTaskMetaQuery } from "@/app/store/api/tasks-api";
import type { TaskFilters } from "@/entities/task";
import { getTaskFilters, hasActiveTaskFilters, taskFilterParamNames } from "./task-filters";

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const priorityLabels: Record<(typeof priorityOptions)[number], string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

export function useTaskFiltersPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { projectId } = useParams();
  const projectIdNumber = Number(projectId);
  const { data: meta } = useGetCreateTaskMetaQuery(projectIdNumber, { skip: !Number.isInteger(projectIdNumber) });

  const filters = useMemo<TaskFilters>(() => getTaskFilters(searchParams), [searchParams]);

  const updateFilter = (key: keyof typeof taskFilterParamNames, value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (value) {
      nextSearchParams.set(taskFilterParamNames[key], value);
    } else {
      nextSearchParams.delete(taskFilterParamNames[key]);
    }

    setSearchParams(nextSearchParams, { replace: true });
  };

  const updateTagFilter = (tagIds: number[]) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames.tagIds);
    tagIds.forEach((tagId) => nextSearchParams.append(taskFilterParamNames.tagIds, String(tagId)));

    setSearchParams(nextSearchParams, { replace: true });
  };

  const clearFilters = () => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.delete(taskFilterParamNames.priority);
    nextSearchParams.delete(taskFilterParamNames.assigneeId);
    nextSearchParams.delete(taskFilterParamNames.tagIds);

    setSearchParams(nextSearchParams, { replace: true });
  };

  return {
    filters,
    assigneeOptions: meta?.users ?? [],
    tagOptions: meta?.tags ?? [],
    priorityOptions,
    priorityLabels,
    hasActiveFilters: hasActiveTaskFilters(filters),
    updateFilter,
    updateTagFilter,
    clearFilters,
  };
}
