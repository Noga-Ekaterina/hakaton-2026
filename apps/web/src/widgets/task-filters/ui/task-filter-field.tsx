import { Cross2Icon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/cn";

type TaskFilterFieldProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  label: string;
  onRemove: () => void;
};

export function TaskFilterField({ children, className, label, onRemove }: TaskFilterFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <div className="[&>button]:pr-10">{children}</div>
        <Button
          type="button"
          variant="ghost"
          className="absolute right-2 top-1/2 z-10 h-7 w-7 -translate-y-1/2 rounded-full p-0 text-slate-700 hover:bg-slate-100"
          onClick={onRemove}
        >
          <Cross2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Убрать фильтр {label}</span>
        </Button>
      </div>
    </div>
  );
}
