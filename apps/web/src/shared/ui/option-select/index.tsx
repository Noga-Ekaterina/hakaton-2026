import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

export type OptionSelectOption = {
  value: string;
  label: string;
  color?: string;
};

type BaseOptionSelectProps = {
  clearable?: boolean;
  id?: string;
  options: OptionSelectOption[];
  emptyLabel?: string;
  triggerClassName?: string;
  triggerLabel?: string;
  disabled?: boolean;
};

type SingleOptionSelectProps = BaseOptionSelectProps & {
  selectionMode?: "single";
  value: string;
  onChange: (value: string) => void;
};

type MultipleOptionSelectProps = BaseOptionSelectProps & {
  selectionMode: "multiple";
  value: string[];
  onChange: (value: string[]) => void;
};

export type OptionSelectProps = SingleOptionSelectProps | MultipleOptionSelectProps;

export function OptionSelect(props: OptionSelectProps) {
  const {
    disabled,
    clearable = true,
    emptyLabel = "Не выбрано",
    id,
    options,
    triggerClassName,
    triggerLabel,
  } = props;
  const selectedValues = new Set(Array.isArray(props.value) ? props.value : props.value ? [props.value] : []);
  const selectedOptions = options.filter((option) => selectedValues.has(option.value));
  const isMultiple = props.selectionMode === "multiple";
  const firstSelectedOption = selectedOptions[0];

  const displayLabel = triggerLabel
    ? isMultiple
      ? selectedOptions.length > 0
        ? `${triggerLabel} (${selectedOptions.length})`
        : emptyLabel
      : triggerLabel
    : isMultiple
      ? selectedOptions.length > 0
        ? selectedOptions.map((option) => option.label).join(", ")
        : emptyLabel
      : firstSelectedOption?.label ?? emptyLabel;

  const toggleValue = (value: string) => {
    if (!isMultiple) {
      props.onChange(value);
      return;
    }

    if (selectedValues.has(value)) {
      props.onChange(props.value.filter((selectedValue) => selectedValue !== value));
      return;
    }

    props.onChange([...props.value, value]);
  };

  const renderOptionContent = (option: OptionSelectOption) => (
    <span className="inline-flex min-w-0 items-center gap-2">
      {option.color ? <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: option.color }} /> : null}
      <span className="truncate">{option.label}</span>
    </span>
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          id={id}
          type="button"
          variant="secondary"
          disabled={disabled}
          className={cn("h-11 w-full justify-between gap-2 rounded-2xl px-4 py-2 text-foreground shadow-sm", triggerClassName)}
        >
          <span className="inline-flex min-w-0 items-center gap-2 truncate">
            {!isMultiple && firstSelectedOption?.color ? (
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: firstSelectedOption.color }} />
            ) : null}
            <span className="truncate">{displayLabel}</span>
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={8}
          className="z-[60] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
        >
          {!isMultiple && clearable ? (
            <DropdownMenu.Item
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
              onSelect={() => props.onChange("")}
            >
              <span className="truncate">{emptyLabel}</span>
              {props.value === "" ? <CheckIcon className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
            </DropdownMenu.Item>
          ) : null}
          {isMultiple && clearable ? (
            <DropdownMenu.CheckboxItem
              checked={selectedOptions.length === 0}
              className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
              onSelect={(event) => {
                event.preventDefault();
                props.onChange([]);
              }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-primary">
                <DropdownMenu.ItemIndicator>
                  <CheckIcon className="h-3 w-3" aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </span>
              <span className="truncate">{emptyLabel}</span>
            </DropdownMenu.CheckboxItem>
          ) : null}
          {options.length > 0 ? (
            options.map((option) =>
              isMultiple ? (
                <DropdownMenu.CheckboxItem
                  key={option.value}
                  checked={selectedValues.has(option.value)}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                  onSelect={(event) => {
                    event.preventDefault();
                    toggleValue(option.value);
                  }}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white text-primary">
                    <DropdownMenu.ItemIndicator>
                      <CheckIcon className="h-3 w-3" aria-hidden="true" />
                    </DropdownMenu.ItemIndicator>
                  </span>
                  {renderOptionContent(option)}
                </DropdownMenu.CheckboxItem>
              ) : (
                <DropdownMenu.Item
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                  onSelect={() => props.onChange(option.value)}
                >
                  {renderOptionContent(option)}
                  {selectedValues.has(option.value) ? <CheckIcon className="h-4 w-4 text-primary" aria-hidden="true" /> : null}
                </DropdownMenu.Item>
              ),
            )
          ) : (
            <DropdownMenu.Item disabled className="rounded-xl px-3 py-2 text-sm text-slate-500 outline-none">
              {emptyLabel}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
