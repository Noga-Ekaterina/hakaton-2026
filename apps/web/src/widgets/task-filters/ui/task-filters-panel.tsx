import { OptionSelect } from "@/shared/ui/option-select";
import { useTaskFiltersPanel } from "../model";
import { TaskDateFilter } from "./task-date-filter";
import { TaskFilterAddMenu } from "./task-filter-add-menu";
import { TaskFilterField } from "./task-filter-field";

export function TaskFiltersPanel() {
  const {
    filters,
    renderedFilters,
    menuFilters,
    assigneeOptions,
    authorOptions,
    tagOptions,
    priorityOptions,
    hasActiveFilters,
    updateFilter,
    updateArrayFilter,
    updateDateFilters,
    updateVisibleDateFilter,
    clearDateFilters,
    removeFilter,
    resetFilters,
  } = useTaskFiltersPanel();

  return (
    <div className="flex w-full flex-wrap items-end gap-4 lg:w-[70%]">
      <TaskFilterAddMenu
        hiddenFilters={menuFilters}
        filters={filters}
        assigneeOptions={assigneeOptions}
        authorOptions={authorOptions}
        priorityOptions={priorityOptions}
        tagOptions={tagOptions}
        hasActiveFilters={hasActiveFilters}
        onDateClear={clearDateFilters}
        onDateRangeChange={updateDateFilters}
        onFilterChange={updateFilter}
        onResetFilters={resetFilters}
        onTagChange={(tagIds) => updateFilter("tagIds", tagIds)}
      />

      {renderedFilters.includes("priority") ? (
        <TaskFilterField className="w-[10.5rem]" htmlFor="task-filter-priority" label="Приоритет" onRemove={() => removeFilter("priority")}>
          <OptionSelect
            id="task-filter-priority"
            selectionMode="multiple"
            value={filters.priority}
            onChange={(value) => updateArrayFilter("priority", value)}
            options={priorityOptions}
            emptyLabel="Все приоритеты"
            triggerLabel="Приоритет"
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
        </TaskFilterField>
      ) : null}

      {renderedFilters.includes("assignee") ? (
        <TaskFilterField className="w-[10.5rem]" htmlFor="task-filter-assignee" label="Исполнитель" onRemove={() => removeFilter("assignee")}>
          <OptionSelect
            id="task-filter-assignee"
            selectionMode="multiple"
            options={assigneeOptions.map((user) => ({ value: String(user.id), label: user.name }))}
            emptyLabel="Все исполнители"
            value={filters.assigneeIds}
            onChange={(value) => updateArrayFilter("assignee", value)}
            triggerLabel="Исполнитель"
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
        </TaskFilterField>
      ) : null}

      {renderedFilters.includes("author") ? (
        <TaskFilterField className="w-[10.5rem]" htmlFor="task-filter-author" label="Автор" onRemove={() => removeFilter("author")}>
          <OptionSelect
            id="task-filter-author"
            selectionMode="multiple"
            options={authorOptions.map((user) => ({ value: String(user.id), label: user.name }))}
            emptyLabel="Все авторы"
            value={filters.authorIds}
            onChange={(value) => updateArrayFilter("author", value)}
            triggerLabel="Автор"
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
        </TaskFilterField>
      ) : null}

      {renderedFilters.includes("tags") ? (
        <TaskFilterField className="w-[10.5rem]" htmlFor="task-filter-tags" label="Теги" onRemove={() => removeFilter("tags")}>
          <OptionSelect
            id="task-filter-tags"
            selectionMode="multiple"
            options={tagOptions.map((tag) => ({ value: String(tag.id), label: tag.name, color: tag.color }))}
            value={filters.tagIds.map(String)}
            onChange={(tagIds) => updateArrayFilter("tags", tagIds.map(Number))}
            emptyLabel="Все теги"
            triggerLabel="Теги"
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
        </TaskFilterField>
      ) : null}

      {renderedFilters.includes("date") ? (
        <TaskFilterField className="w-[10.5rem]" htmlFor="task-filter-date" label="Дата" onRemove={() => removeFilter("date")}>
          <TaskDateFilter
            createdFrom={filters.createdFrom}
            createdTo={filters.createdTo}
            hideLabel
            onChange={updateVisibleDateFilter}
            onClear={() => removeFilter("date")}
          />
        </TaskFilterField>
      ) : null}
    </div>
  );
}
