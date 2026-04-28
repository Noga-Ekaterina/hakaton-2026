import { useDrag } from "react-dnd";
import { useUpdateTaskStatusMutation } from "@/app/store/api/tasks-api";
import { TASK_DND_TYPE } from "../model/dnd";
import type { Task } from "../model/types";
import { Button } from "@/shared/ui/button";

const priorityMeta = {
  LOW: {
    label: "Низкий",
    className: "bg-slate-100 text-slate-700",
  },
  MEDIUM: {
    label: "Средний",
    className: "bg-cyan-100 text-cyan-900",
  },
  HIGH: {
    label: "Высокий",
    className: "bg-orange-100 text-orange-900",
  },
  CRITICAL: {
    label: "Критический",
    className: "bg-red-100 text-red-900",
  },
} as const;

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const priority = priorityMeta[task.priority];
  const [updateTaskStatus, { isLoading: isStatusUpdating }] = useUpdateTaskStatusMutation();
  const nextStatus = task.status === "DONE" ? "NEW" : "DONE";
  const statusButtonLabel = task.status === "DONE" ? "не сделана" : "сделана";
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: TASK_DND_TYPE,
      item: { id: task.id, status: task.status },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [task.id, task.status],
  );

  const handleStatusButtonClick = () => {
    updateTaskStatus({ id: task.id, status: nextStatus, projectId: task.projectId });
  };

  return (
    <article
      ref={dragRef}
      aria-grabbed={isDragging}
      className={`cursor-grab rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm transition duration-200 active:cursor-grabbing ${
        isDragging ? "scale-[0.98] opacity-50" : "hover:-translate-y-1"
      }`}
    >
      <div className="">
        <div className="space-y-2 mb-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Задача #{task.id}</p>
            <Button
              variant="secondary"
              onClick={handleStatusButtonClick}
              disabled={isStatusUpdating}
            >
              {statusButtonLabel}
            </Button>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">{task.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}>{priority.label}</span>
        </div>
      </div>

      {task.shortDescription ? <p className="mt-4 text-sm leading-6 text-slate-600">{task.shortDescription}</p> : null}

      <dl className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Исполнитель</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{task.assigneeName}</dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Автор</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{task.authorName}</dd>
        </div>
        <div className="col-span-2 rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Story points</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{task.storyPoints ?? "Не оценена"}</dd>
        </div>
      </dl>
    </article>
  );
}
