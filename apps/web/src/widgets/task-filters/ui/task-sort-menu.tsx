import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import type { TaskSort, TaskSortDirection, TaskSortField } from "@/entities/task";
import { cn } from "@/shared/lib/cn";

type TaskSortMenuProps = {
  sort: TaskSort | null;
  onChange: (sort: TaskSort | null) => void;
};

const sortOptions = [
  {
    value: "createdAt",
    label: "Дата",
  },
  {
    value: "priority",
    label: "Приоритет",
  },
] as const satisfies readonly {
  value: TaskSortField;
  label: string;
}[];

function getSortLabel(sort: TaskSort | null) {
  return sortOptions.find((option) => option.value === sort?.field)?.label ?? "Сортировка";
}

function getNextDirection(direction: TaskSortDirection) {
  return direction === "asc" ? "desc" : "asc";
}

export function TaskSortMenu({ sort, onChange }: TaskSortMenuProps) {
  const selectedValue = sort?.field ?? "";
  const direction = sort?.direction ?? "desc";
  const DirectionIcon = direction === "asc" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <div className="space-y-2">
      <div className="inline-flex h-11 w-44 items-center overflow-hidden rounded-2xl border border-border bg-card text-sm font-semibold text-foreground transition focus-within:ring-2 focus-within:ring-primary/40 hover:bg-white">
        <button
          type="button"
          className="flex h-full w-11 shrink-0 items-center justify-center border-r border-border transition hover:bg-primary/10 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
          disabled={!sort}
          aria-label={direction === "asc" ? "Сортировать по убыванию" : "Сортировать по возрастанию"}
          title={direction === "asc" ? "По возрастанию" : "По убыванию"}
          onClick={() => {
            if (sort) {
              onChange({ ...sort, direction: getNextDirection(sort.direction) });
            }
          }}
        >
          <DirectionIcon className="h-4 w-4" aria-hidden="true" />
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex h-full min-w-0 flex-1 items-center justify-between gap-2 px-4 transition hover:bg-white focus-visible:outline-none"
            >
              <span className="min-w-0 truncate text-left">{getSortLabel(sort)}</span>
              <ChevronDownIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={8}
              className="z-[60] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
            >
              <DropdownMenu.RadioGroup value={selectedValue}>
                {sortOptions.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                    onSelect={() => onChange({ field: option.value, direction })}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-primary",
                        selectedValue === option.value && "border-primary",
                      )}
                    >
                      <DropdownMenu.ItemIndicator>
                        <CheckIcon className="h-3 w-3" aria-hidden="true" />
                      </DropdownMenu.ItemIndicator>
                    </span>
                    <span className="truncate">{option.label}</span>
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
}
