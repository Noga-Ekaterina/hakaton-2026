import { TaskTagSelect } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { UserSelect } from "@/entities/user";
import { useTaskFiltersPanel } from "../model";

export function TaskFiltersPanel() {
  const { filters, assigneeOptions, tagOptions, priorityOptions, priorityLabels, updateFilter, updateTagFilter, clearFilters } =
    useTaskFiltersPanel();

  return (
    <>
      <div className=" grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="task-filter-priority">Приоритет</Label>
          <select
            id="task-filter-priority"
            value={filters.priority}
            onChange={(event) => updateFilter("priority", event.target.value)}
            className="flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Все приоритеты</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-filter-assignee">Исполнитель</Label>
          <UserSelect
            id="task-filter-assignee"
            users={assigneeOptions}
            emptyLabel="Все исполнители"
            value={filters.assigneeId}
            onChange={(event) => updateFilter("assigneeId", event.target.value)}
            className="flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-2">
          <Label>Теги</Label>
          <TaskTagSelect
            tags={tagOptions}
            value={filters.tagIds}
            onChange={updateTagFilter}
            emptyTagsLabel="В проекте пока нет тегов."
            mode="checkboxDropdown"
            triggerClassName="w-full rounded-2xl border-border bg-white px-4 py-2 text-foreground shadow-sm hover:bg-white focus-visible:ring-primary/20"
            triggerLabel="Теги"
          />
        </div>
        <Button type="button" variant="secondary" onClick={clearFilters} className="h-11 rounded-2xl">
          Сбросить фильтры
        </Button>
      </div>
    </>
  );
}
