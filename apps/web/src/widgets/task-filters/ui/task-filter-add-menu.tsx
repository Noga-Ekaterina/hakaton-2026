import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, Cross2Icon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import type { TaskFilters } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import type { TaskFilterKey } from "../model";
import type { TaskArrayFilterParamName } from "../model/task-filters";

type FilterOption = {
  value: string;
  label: string;
  color?: string;
};

type UserOption = {
  id: number;
  name: string;
};

type TagOption = {
  id: number;
  name: string;
  color: string;
};

type TaskFilterAddMenuProps = {
  hiddenFilters: TaskFilterKey[];
  filters: TaskFilters;
  assigneeOptions: UserOption[];
  authorOptions: UserOption[];
  priorityOptions: FilterOption[];
  tagOptions: TagOption[];
  hasActiveFilters: boolean;
  onDateClear: () => void;
  onDateChange: (key: "createdFrom" | "createdTo", value: string) => void;
  onFilterChange: (key: TaskArrayFilterParamName, value: string[] | number[]) => void;
  onResetFilters: () => void;
  onTagChange: (tagIds: number[]) => void;
};

const filterLabels: Record<TaskFilterKey, string> = {
  priority: "Приоритет",
  assignee: "Исполнитель",
  author: "Автор",
  tags: "Теги",
  date: "Дата",
};

function toggleValue(value: string, selectedValues: string[]) {
  return selectedValues.includes(value) ? selectedValues.filter((item) => item !== value) : [...selectedValues, value];
}

function toggleTag(tagId: number, selectedTagIds: number[]) {
  return selectedTagIds.includes(tagId) ? selectedTagIds.filter((item) => item !== tagId) : [...selectedTagIds, tagId];
}

function FilterSubTrigger({ filter }: { filter: TaskFilterKey }) {
  return (
    <DropdownMenu.SubTrigger className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50 data-[state=open]:bg-slate-50">
      {filterLabels[filter]}
      <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
    </DropdownMenu.SubTrigger>
  );
}

function ValueItem({
  checked,
  color,
  label,
  onSelect,
}: {
  checked: boolean;
  color?: string;
  label: string;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
      onSelect={(event) => {
        event.preventDefault();
        onSelect();
      }}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-primary">
        <DropdownMenu.ItemIndicator>
          <CheckIcon className="h-3 w-3" aria-hidden="true" />
        </DropdownMenu.ItemIndicator>
      </span>
      <span className="inline-flex min-w-0 items-center gap-2">
        {color ? <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} /> : null}
        <span className="truncate">{label}</span>
      </span>
    </DropdownMenu.CheckboxItem>
  );
}

function AllValuesItem({ checked, label, onSelect }: { checked: boolean; label: string; onSelect: () => void }) {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
      onSelect={(event) => {
        event.preventDefault();
        onSelect();
      }}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-primary">
        <DropdownMenu.ItemIndicator>
          <CheckIcon className="h-3 w-3" aria-hidden="true" />
        </DropdownMenu.ItemIndicator>
      </span>
      <span className="truncate">{label}</span>
    </DropdownMenu.CheckboxItem>
  );
}

export function TaskFilterAddMenu({
  hiddenFilters,
  filters,
  assigneeOptions,
  authorOptions,
  priorityOptions,
  tagOptions,
  hasActiveFilters,
  onDateClear,
  onDateChange,
  onFilterChange,
  onResetFilters,
  onTagChange,
}: TaskFilterAddMenuProps) {
  return (
    <div className="space-y-2">
      <p className="h-5 text-sm font-medium text-foreground" aria-hidden="true" />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button type="button" variant="secondary" className="h-11 gap-2 rounded-2xl ">
            <MixerHorizontalIcon className="h-4 w-4" aria-hidden="true" />
            Фильтры
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={8}
            className="z-[60] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
          >
            {hasActiveFilters ? (
              <>
                <DropdownMenu.Item
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                  onSelect={onResetFilters}
                >
                  <Cross2Icon className="h-4 w-4" aria-hidden="true" />
                  Сбросить все
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
              </>
            ) : null}

            {hiddenFilters.length > 0 ? (
              hiddenFilters.map((filter) => (
                <DropdownMenu.Sub key={filter}>
                  <FilterSubTrigger filter={filter} />
                  <DropdownMenu.Portal>
                    <DropdownMenu.SubContent
                      sideOffset={8}
                      alignOffset={-4}
                      className="z-[70] grid max-h-[min(70vh,520px)] min-w-60 gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
                    >
                      {filter === "priority"
                        ? [
                            <AllValuesItem
                              key="all-priorities"
                              checked={filters.priority.length === 0}
                              label="Все приоритеты"
                              onSelect={() => onFilterChange("priority", [])}
                            />,
                            ...priorityOptions.map((priority) => (
                              <ValueItem
                                key={priority.value}
                                checked={filters.priority.includes(priority.value as TaskFilters["priority"][number])}
                                color={priority.color}
                                label={priority.label}
                                onSelect={() => onFilterChange("priority", toggleValue(priority.value, filters.priority))}
                              />
                            )),
                          ]
                        : null}

                      {filter === "assignee"
                        ? [
                            <AllValuesItem
                              key="all-assignees"
                              checked={filters.assigneeIds.length === 0}
                              label="Все исполнители"
                              onSelect={() => onFilterChange("assigneeId", [])}
                            />,
                            ...assigneeOptions.map((user) => (
                              <ValueItem
                                key={user.id}
                                checked={filters.assigneeIds.includes(String(user.id))}
                                label={user.name}
                                onSelect={() => onFilterChange("assigneeId", toggleValue(String(user.id), filters.assigneeIds))}
                              />
                            )),
                          ]
                        : null}

                      {filter === "author"
                        ? [
                            <AllValuesItem
                              key="all-authors"
                              checked={filters.authorIds.length === 0}
                              label="Все авторы"
                              onSelect={() => onFilterChange("authorId", [])}
                            />,
                            ...authorOptions.map((user) => (
                              <ValueItem
                                key={user.id}
                                checked={filters.authorIds.includes(String(user.id))}
                                label={user.name}
                                onSelect={() => onFilterChange("authorId", toggleValue(String(user.id), filters.authorIds))}
                              />
                            )),
                          ]
                        : null}

                      {filter === "tags"
                        ? tagOptions.length > 0
                          ? [
                              <AllValuesItem
                                key="all-tags"
                                checked={filters.tagIds.length === 0}
                                label="Все теги"
                                onSelect={() => onTagChange([])}
                              />,
                              ...tagOptions.map((tag) => (
                                <ValueItem
                                  key={tag.id}
                                  checked={filters.tagIds.includes(tag.id)}
                                  color={tag.color}
                                  label={tag.name}
                                  onSelect={() => onTagChange(toggleTag(tag.id, filters.tagIds))}
                                />
                              )),
                            ]
                          : (
                              <DropdownMenu.Item disabled className="rounded-xl px-3 py-2 text-sm text-slate-500 outline-none">
                                В проекте пока нет тегов
                              </DropdownMenu.Item>
                            )
                        : null}

                      {filter === "date" ? (
                        <div className="grid gap-3 p-2">
                          <AllValuesItem
                            checked={!filters.createdFrom && !filters.createdTo}
                            label="Все даты"
                            onSelect={onDateClear}
                          />
                          <div className="space-y-2">
                            <Label htmlFor="task-filter-add-created-from">Дата с</Label>
                            <Input
                              id="task-filter-add-created-from"
                              type="date"
                              value={filters.createdFrom}
                              onChange={(event) => onDateChange("createdFrom", event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="task-filter-add-created-to">Дата по</Label>
                            <Input
                              id="task-filter-add-created-to"
                              type="date"
                              value={filters.createdTo}
                              onChange={(event) => onDateChange("createdTo", event.target.value)}
                            />
                          </div>
                        </div>
                      ) : null}
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Portal>
                </DropdownMenu.Sub>
              ))
            ) : (
              <DropdownMenu.Item disabled className="rounded-xl px-3 py-2 text-sm text-slate-500 outline-none">
                Все фильтры добавлены
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
