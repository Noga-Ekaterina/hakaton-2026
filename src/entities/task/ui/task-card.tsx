import { useDrag } from "react-dnd";
import { TASK_DND_TYPE } from "../model/dnd";
import type { Task } from "../model/types";

const statusMeta = {
  NEW: {
    label: "Новая",
    className: "bg-sky-100 text-sky-800",
  },
  IN_PROGRESS: {
    label: "В процессе",
    className: "bg-amber-100 text-amber-900",
  },
  DONE: {
    label: "Сделана",
    className: "bg-emerald-100 text-emerald-800",
  },
  BLOCKED: {
    label: "Блок",
    className: "bg-rose-100 text-rose-800",
  },
} as const;

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

const deadlineFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDeadline(deadline: string) {
  return deadlineFormatter.format(new Date(deadline));
}

type TaskCardProps = {
  task: Task;
};

export function TaskCard({ task }: TaskCardProps) {
  const priority = priorityMeta[task.priority];
  const status = statusMeta[task.status];
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Задача #{task.id}</p>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">{task.title}</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priority.className}`}>{priority.label}</span>
          {task.isOverdue && task.status !== "DONE" ? (
            <>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span>
              <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">Просрочена</span>            
            </>
          ) : null}
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{task.shortDescription}</p>

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
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Дедлайн</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{formatDeadline(task.deadline)}</dd>
        </div>
      </dl>
    </article>
  );
}
