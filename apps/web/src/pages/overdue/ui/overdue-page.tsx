import { useMemo } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetProjectsQuery } from "@/app/store/api/admin-api";
import { useGetTasksQuery } from "@/app/store/api/tasks-api";
import { useAppSelector } from "@/app/store/hooks";
import { TaskCard } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { paths, projectPath } from "@/shared/config/routes";
import { getOverdueTasks } from "@/widgets/task-board/model/get-column-tasks";
import { getTaskFilters } from "@/widgets/task-filters";

export function OverduePage() {
  const { projectId } = useParams();
  const { data: projects } = useGetProjectsQuery();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const filters = useMemo(() => getTaskFilters(searchParams), [searchParams]);
  const projectIdNumber = Number(projectId);
  const shouldFetchTasks = Number.isInteger(projectIdNumber);
  const { data: tasks, isLoading, isError, error } = useGetTasksQuery(shouldFetchTasks ? projectIdNumber : skipToken);

  const project = useMemo(
    () => (Number.isInteger(projectIdNumber) ? projects?.find((item) => item.id === projectIdNumber) ?? null : null),
    [projectIdNumber, projects],
  );

  const accessibleProjectIds = useMemo(() => {
    if (currentUser?.role === "ADMIN") {
      return new Set(projects?.map((item) => item.id) ?? []);
    }

    return new Set(currentUser?.projects?.map((item) => item.id) ?? []);
  }, [currentUser?.projects, currentUser?.role, projects]);

  const overdueTasks = useMemo(() => getOverdueTasks(tasks, filters), [filters, tasks]);

  if (shouldFetchTasks && project && !accessibleProjectIds.has(project.id)) {
    return <Navigate to={paths.home} replace />;
  }

  if (!shouldFetchTasks) {
    return (
      <section className="rounded-[2rem] border border-rose-200/80 bg-gradient-to-br from-rose-50 to-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">Просрочка</h2>
            <p className="mt-2 text-sm text-slate-600">
              Выберите проект на главной странице, чтобы увидеть его просроченные задачи.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link to={paths.home}>К проектам</Link>
          </Button>
        </div>
      </section>
    );
  }

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
              <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">
                {project ? `Просроченные задачи: ${project.name}` : "Просроченные задачи"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {project
                  ? "Здесь собраны только просроченные задачи этого проекта."
                  : "Здесь собраны только задачи с просроченным дедлайном."}
              </p>
            </div>
            <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
              {overdueTasks.length}
            </span>
          </div>

          {project ? (
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to={projectPath(project.id)}>К доске проекта</Link>
              </Button>
            </div>
          ) : null}

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
