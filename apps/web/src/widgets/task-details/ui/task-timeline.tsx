import { CreateTaskCommentForm } from "@/features/task/create-task-comment";
import {
  formatTaskTimelineDate,
  TaskChangeLine,
  TaskEventTitle,
  type TaskTimelineItem,
} from "@/entities/task";

type TaskTimelineProps = {
  isLoading: boolean;
  taskId: number;
  timeline: TaskTimelineItem[];
  userNameById: Map<number, string>;
};

export function TaskTimeline({ isLoading, taskId, timeline, userNameById }: TaskTimelineProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
      <h3 className="text-xl font-black tracking-tight text-slate-950">Обсуждение и история</h3>

      <CreateTaskCommentForm taskId={taskId} />

      <div className="mt-6 space-y-4">
        {isLoading ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Загружаем историю...</p> : null}

        {!isLoading && timeline.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">Пока нет комментариев и изменений.</p>
        ) : null}

        {timeline.map((item) => (
          <article key={`${item.kind}-${item.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            {item.kind === "comment" ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-950">{item.author.name}</p>
                  <time className="text-xs font-semibold text-slate-500">{formatTaskTimelineDate(item.createdAt)}</time>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {item.isDeleted ? "Комментарий удален." : item.body}
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-950">
                    <TaskEventTitle item={item} userNameById={userNameById} />
                  </p>
                  <time className="text-xs font-semibold text-slate-500">{formatTaskTimelineDate(item.createdAt)}</time>
                </div>
                {item.type === "TASK_UPDATED" && item.changes.length > 0 ? (
                  <details className="mt-3 text-sm leading-6 text-slate-700">
                    <summary className="cursor-pointer font-semibold text-slate-600">Показать изменения</summary>
                    <ul className="mt-2 space-y-2">
                      {item.changes.map((change, index) => (
                        <li key={`${change.field}-${index}`}>
                          <TaskChangeLine change={change} userNameById={userNameById} />
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
                {item.type !== "TASK_UPDATED" && item.type !== "STATUS_UPDATED" && item.changes.length > 0 ? (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {item.changes.map((change, index) => (
                      <li key={`${change.field}-${index}`}>
                        <TaskChangeLine change={change} userNameById={userNameById} />
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
