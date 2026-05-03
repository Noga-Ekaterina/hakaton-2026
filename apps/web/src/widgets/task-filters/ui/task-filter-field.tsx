import { Cross2Icon } from "@radix-ui/react-icons";
import type { ReactNode } from "react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/cn";

type TaskFilterFieldProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  label: string;
  onRemove: () => void;
};

export function TaskFilterField({ children, className, htmlFor, label, onRemove }: TaskFilterFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-5 items-center justify-between gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        <Button type="button" variant="ghost" className="h-7 w-7 rounded-full p-0" onClick={onRemove}>
          <Cross2Icon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Убрать фильтр {label}</span>
        </Button>
      </div>
      {children}
    </div>
  );
}
