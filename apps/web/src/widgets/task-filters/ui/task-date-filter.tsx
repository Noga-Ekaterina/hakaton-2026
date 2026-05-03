import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type TaskDateFilterProps = {
  createdFrom: string;
  createdTo: string;
  hideLabel?: boolean;
  onChange: (key: "createdFrom" | "createdTo", value: string) => void;
  onClear: () => void;
};

export function TaskDateFilter({ createdFrom, createdTo, hideLabel = false, onChange, onClear }: TaskDateFilterProps) {
  const selectedFiltersCount = Number(Boolean(createdFrom)) + Number(Boolean(createdTo));
  const filterLabel = selectedFiltersCount > 0 ? `Дата (${selectedFiltersCount})` : "Все даты";

  return (
    <div className="space-y-2">
      {hideLabel ? null : <Label htmlFor="task-filter-date">Дата</Label>}
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            id="task-filter-date"
            type="button"
            variant="secondary"
            className="h-11 w-full justify-between gap-2 rounded-2xl border-border bg-white px-4 py-2 text-foreground shadow-sm hover:bg-white focus-visible:ring-primary/20"
          >
            <span className="truncate">{filterLabel}</span>
            <ChevronDownIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={8}
            className="z-[60] w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
          >
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="task-filter-created-from">Дата с</Label>
                <Input
                  id="task-filter-created-from"
                  type="date"
                  value={createdFrom}
                  onChange={(event) => onChange("createdFrom", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-filter-created-to">Дата по</Label>
                <Input
                  id="task-filter-created-to"
                  type="date"
                  value={createdTo}
                  onChange={(event) => onChange("createdTo", event.target.value)}
                />
              </div>

              <Button type="button" variant="ghost" className="h-10 rounded-xl" onClick={onClear}>
                Очистить дату
              </Button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
