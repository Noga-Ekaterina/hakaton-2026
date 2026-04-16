import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useTaskFiltersPanel } from "../model";

export function TaskFiltersPanel() {
  const { filters, assigneeOptions, priorityOptions, priorityLabels, updateFilter, clearFilters } =
    useTaskFiltersPanel();

  return (
    <>
      <div className=" grid gap-4 grid-cols-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="task-filter-date">Дата</Label>
          <Input id="task-filter-date" type="date" value={filters.date} onChange={(event) => updateFilter("date", event.target.value)} />
        </div>

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
          <select
            id="task-filter-assignee"
            value={filters.assigneeId}
            onChange={(event) => updateFilter("assigneeId", event.target.value)}
            className="flex h-11 w-full rounded-2xl border border-border bg-white px-4 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Все исполнители</option>
            {assigneeOptions.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="button" variant="secondary" onClick={clearFilters} className="h-11 rounded-2xl">
          Сбросить фильтры
        </Button>
      </div>
    </>
  );
}
