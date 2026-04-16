import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetTasksQuery } from "@/app/store/api/tasks-api";
import { TaskCard } from "@/entities/task";
import { getOverdueTasks } from "@/widgets/task-board/model/get-column-tasks";
import { getTaskFilters } from "@/widgets/task-filters";

export function OverduePage() {
  const { data: tasks, isLoading, isError, error } = useGetTasksQuery();
  const [searchParams] = useSearchParams();
  const filters = useMemo(() => getTaskFilters(searchParams), [searchParams]);
  const overdueTasks = useMemo(() => getOverdueTasks(tasks, filters), [tasks, filters]);

  return (
    <section>
      {isLoading ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
          Загружаем просроченные задачи...
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить просроченные задачи.
          {error && "data" in error ? <div className="mt-2 text-sm text-rose-700">{String(error.data)}</div> : null}
        </section>
      ) : null}

      {tasks ? (
        <section className="rounded-[2rem] border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">Просроченные задачи</h2>
              <p className="mt-2 text-sm text-slate-600">Здесь собраны только задачи с просроченным дедлайном.</p>
            </div>
            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
              {overdueTasks.length}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {overdueTasks.length > 0 ? (
              overdueTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="rounded-3xl border border-dashed border-rose-300 bg-white/70 p-4 text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
                Просроченных задач пока нет.
              </div>
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
