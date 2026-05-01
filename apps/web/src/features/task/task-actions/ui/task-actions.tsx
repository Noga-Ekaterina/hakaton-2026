import { CheckIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons";
import type { Task } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { useTaskActions } from "../model/use-task-actions";

type TaskActionsProps = {
  task: Task;
  mode?: "icon" | "full";
  onDeleteClick?: (task: Task) => void;
};

export function TaskActions({ mode = "icon", onDeleteClick, task }: TaskActionsProps) {
  const { handleStatusButtonClick, isStatusUpdating, statusButtonLabel } = useTaskActions(task);
  const isIconMode = mode === "icon";

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        className={
          isIconMode
            ? `h-9 w-9 shrink-0 px-0 py-0 ${
                task.status === "DONE"
                  ? "text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  : "text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`
            : `gap-2 ${
                task.status === "DONE"
                  ? "text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                  : "text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              }`
        }
        aria-label={statusButtonLabel}
        onClick={handleStatusButtonClick}
        disabled={isStatusUpdating}
      >
        {task.status === "DONE" ? (
          <Cross2Icon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <CheckIcon className="h-5 w-5" aria-hidden="true" />
        )}
        {isIconMode ? null : <span>{statusButtonLabel}</span>}
      </Button>
      {onDeleteClick ? (
        <Button
          type="button"
          variant="secondary"
          className={
            isIconMode
              ? "h-9 w-9 shrink-0 px-0 py-0 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              : "gap-2 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          }
          aria-label="Удалить задачу"
          onClick={() => onDeleteClick(task)}
        >
          <TrashIcon className="h-5 w-5" aria-hidden="true" />
          {isIconMode ? null : <span>Удалить</span>}
        </Button>
      ) : null}
    </div>
  );
}
