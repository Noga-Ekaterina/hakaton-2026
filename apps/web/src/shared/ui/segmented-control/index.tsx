import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/shared/lib/cn";

type SegmentedControlProps = React.HTMLAttributes<HTMLDivElement>;

type SegmentedControlItemProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  asChild?: boolean;
};

export function segmentedControlItemClass(active?: boolean, className?: string) {
  return cn(
    "rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    active ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-950",
    className,
  );
}

export function SegmentedControl({ className, ...props }: SegmentedControlProps) {
  return <div className={cn("inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm", className)} {...props} />;
}

export const SegmentedControlItem = React.forwardRef<HTMLButtonElement, SegmentedControlItemProps>(
  function SegmentedControlItem({ active = false, asChild = false, className, ...props }, ref) {
    const Comp = asChild ? Slot : "button";

    return <Comp ref={ref} className={segmentedControlItemClass(active, className)} {...props} />;
  },
);
