import { useDrag } from "react-dnd";
import { Link } from "react-router-dom";
import { CheckIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons";
import { useUpdateTaskStatusMutation } from "@/app/store/api/tasks-api";
import { TASK_DND_TYPE } from "../model/dnd";
import type { Task } from "../model/types";
import { API_BASE_URL } from "@/shared/config/api";
import { taskPath } from "@/shared/config/routes";
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
  onDeleteClick?: (task: Task) => void;
};

export function TaskCard({ task, onDeleteClick }: TaskCardProps) {
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

  const taskImages = task.images.map((image) => ({
    ...image,
    src: image.url.startsWith("http") ? image.url : `${API_BASE_URL}${image.url}`,
  }));

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
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant="secondary"
                className={`h-9 w-9 shrink-0 px-0 py-0 ${
                  task.status === "DONE"
                    ? "text-rose-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    : "text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
                aria-label={statusButtonLabel}
                onClick={handleStatusButtonClick}
                disabled={isStatusUpdating}
              >
                {task.status === "DONE" ? (
                  <Cross2Icon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <CheckIcon className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-9 w-9 shrink-0 px-0 py-0 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                aria-label="Удалить задачу"
                onClick={() => onDeleteClick?.(task)}
              >
                <TrashIcon className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            <Link className="transition hover:text-primary" to={taskPath(task.projectId, task.id)}>
              {task.title}
            </Link>
          </h3>
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
      </dl>
      {taskImages.length > 0 ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {taskImages.map((image) => (
            <a key={image.id} href={image.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl bg-slate-100">
              <img src={image.src} alt={image.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
