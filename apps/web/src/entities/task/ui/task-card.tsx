import type { ReactNode } from "react";
import { useDrag } from "react-dnd";
import { Link } from "react-router-dom";
import { TASK_DND_TYPE } from "../model/dnd";
import { getTaskImageSrc } from "../model/task-images";
import type { Task } from "../model/types";
import { TaskPriorityBadge, TaskTagBadge } from "./task-badge";
import { taskPath } from "@/shared/config/routes";

type TaskCardProps = {
  actions?: ReactNode;
  task: Task;
};

export function TaskCard({ actions, task }: TaskCardProps) {
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

  const taskImages = task.images.map((image) => ({
    ...image,
    src: getTaskImageSrc(image.url),
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
            {actions}
          </div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">
            <Link className="transition hover:text-primary" to={taskPath(task.projectId, task.id)}>
              {task.title}
            </Link>
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          <TaskPriorityBadge priority={task.priority} />
          {task.tags.map((tag) => (
            <TaskTagBadge key={tag.id} tag={tag} />
          ))}
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
