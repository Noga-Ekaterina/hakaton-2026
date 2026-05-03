import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import { Button } from "@/shared/ui/button";
import { OptionSelect } from "@/shared/ui/option-select";
import type { TaskTag } from "../model/types";
import { TaskTagBadge } from "./task-badge";

type TaskTagSelectProps = {
  tags: TaskTag[];
  value: number[];
  onChange: (value: number[]) => void;
  emptySelectedLabel?: string;
  emptyTagsLabel?: string;
  mode?: "badges" | "checkboxDropdown";
  selectedPlacement?: "inline" | "below";
  triggerClassName?: string;
  triggerLabel?: string;
};

export function TaskTagSelect({
  emptySelectedLabel = "Теги не добавлены.",
  emptyTagsLabel = "Теги проекта пока не добавлены.",
  mode = "badges",
  onChange,
  selectedPlacement = "inline",
  tags,
  triggerClassName,
  triggerLabel = "Добавить",
  value,
}: TaskTagSelectProps) {
  const selectedIds = new Set(value);
  const selectedTags = tags.filter((tag) => selectedIds.has(tag.id));
  const availableTags = tags.filter((tag) => !selectedIds.has(tag.id));

  const addTag = (tagId: number) => {
    if (!selectedIds.has(tagId)) {
      onChange([...value, tagId]);
    }
  };

  const removeTag = (tagId: number) => {
    onChange(value.filter((id) => id !== tagId));
  };

  if (tags.length === 0) {
    return <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">{emptyTagsLabel}</p>;
  }

  if (mode === "checkboxDropdown") {
    return (
      <OptionSelect
        selectionMode="multiple"
        options={tags.map((tag) => ({ value: String(tag.id), label: tag.name, color: tag.color }))}
        value={value.map(String)}
        onChange={(tagIds) => onChange(tagIds.map(Number))}
        emptyLabel={emptyTagsLabel}
        triggerClassName={triggerClassName}
        triggerLabel={triggerLabel}
      />
    );
  }

  const selectedContent =
    selectedTags.length > 0 ? (
      selectedTags.map((tag) => (
        <button key={tag.id} type="button" className="group inline-flex items-center gap-1" onClick={() => removeTag(tag.id)}>
          <TaskTagBadge tag={tag} />
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-slate-500 transition group-hover:border-rose-200 group-hover:bg-rose-50 group-hover:text-rose-600"
            aria-hidden="true"
          >
            <Cross2Icon className="h-3 w-3" />
          </span>
          <span className="sr-only">Удалить тег {tag.name}</span>
        </button>
      ))
    ) : (
      <p className="text-sm text-slate-500">{emptySelectedLabel}</p>
    );

  const trigger = (
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button type="button" variant="secondary" className="gap-2">
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            {triggerLabel}
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="start"
            sideOffset={8}
            className="z-[60] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
          >
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <DropdownMenu.Item
                  key={tag.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                  onSelect={() => addTag(tag.id)}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: tag.color }} />
                    {tag.name}
                  </span>
                  <CheckIcon className="h-4 w-4 opacity-0" aria-hidden="true" />
                </DropdownMenu.Item>
              ))
            ) : (
              <DropdownMenu.Item disabled className="rounded-xl px-3 py-2 text-sm text-slate-500 outline-none">
                Все теги добавлены
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
  );

  if (selectedPlacement === "below") {
    return (
      <div className="grid gap-2">
        <div>{trigger}</div>
        <div className="flex min-h-6 flex-wrap items-center gap-2">{selectedContent}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedContent}
      {trigger}
    </div>
  );
}
