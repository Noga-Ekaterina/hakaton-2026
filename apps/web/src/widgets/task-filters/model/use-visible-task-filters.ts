import { useEffect, useMemo, useState } from "react";
import type { TaskFilters } from "@/entities/task";
import { maxVisibleTaskFilters, taskFilterKeys, type TaskFilterKey } from "./task-filter-keys";

function getActiveTaskFilterKeys(filters: TaskFilters) {
  const activeKeys: TaskFilterKey[] = [];

  if (filters.priority.length > 0) {
    activeKeys.push("priority");
  }
  if (filters.assigneeIds.length > 0) {
    activeKeys.push("assignee");
  }
  if (filters.authorIds.length > 0) {
    activeKeys.push("author");
  }
  if (filters.tagIds.length > 0) {
    activeKeys.push("tags");
  }
  if (filters.createdFrom || filters.createdTo) {
    activeKeys.push("date");
  }

  return activeKeys;
}

export function useVisibleTaskFilters(filters: TaskFilters) {
  const [visibleFilters, setVisibleFilters] = useState<TaskFilterKey[]>([]);
  const activeFilterKeys = useMemo(() => getActiveTaskFilterKeys(filters), [filters]);

  useEffect(() => {
    setVisibleFilters((currentFilters) => {
      const activeFilters = new Set(activeFilterKeys);
      const orderedFilters = currentFilters.filter((filter) => activeFilters.has(filter));

      activeFilterKeys.forEach((filter) => {
        if (!orderedFilters.includes(filter)) {
          orderedFilters.push(filter);
        }
      });

      return orderedFilters;
    });
  }, [activeFilterKeys]);

  const hideFilter = (filter: TaskFilterKey) => {
    setVisibleFilters((currentFilters) => currentFilters.filter((currentFilter) => currentFilter !== filter));
  };

  const resetVisibleFilters = () => {
    setVisibleFilters([]);
  };

  const renderedFilters = visibleFilters.slice(0, maxVisibleTaskFilters);
  const menuFilters = taskFilterKeys.filter((filter) => !renderedFilters.includes(filter));

  return {
    renderedFilters,
    menuFilters,
    hideFilter,
    resetVisibleFilters,
  };
}
