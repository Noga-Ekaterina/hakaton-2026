import { useMemo } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetProjectsQuery } from "@/app/store/api/admin-api";
import { useGetTasksQuery } from "@/app/store/api/tasks-api";
import { useAppSelector } from "@/app/store/hooks";
import { TaskCard } from "@/entities/task";
import { DeleteTaskModal, useDeleteTaskModal } from "@/features/task/delete-task";
import { TaskActions } from "@/features/task/task-actions";
import { Button } from "@/shared/ui/button";
import { paths, projectPath } from "@/shared/config/routes";
import { getDoneTasks } from "@/widgets/task-board";
import { getTaskFilters } from "@/widgets/task-filters";

export function DonePage() {
  const { projectId } = useParams();
  const { data: projects } = useGetProjectsQuery();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const search = searchParams.toString();
  const filters = useMemo(() => getTaskFilters(searchParams), [search, searchParams]);
  const projectIdNumber = Number(projectId);
  const shouldFetchTasks = Number.isInteger(projectIdNumber);
  const { data: tasks, isLoading, isError, error } = useGetTasksQuery(shouldFetchTasks ? projectIdNumber : skipToken);
  const deleteTaskModal = useDeleteTaskModal();

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

  const doneTasks = useMemo(() => getDoneTasks(tasks, filters), [filters, tasks]);

  if (shouldFetchTasks && project && !accessibleProjectIds.has(project.id)) {
    return <Navigate to={paths.home} replace />;
  }

  if (!shouldFetchTasks) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <section>
      {isLoading ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
          Загружаем сделанные задачи...
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить сделанные задачи.
          {error && "data" in error ? <div className="mt-2 text-sm text-rose-700">{String(error.data)}</div> : null}
        </section>
      ) : null}

      {tasks ? (
        <section className="rounded-[2rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">
                {project ? `Сделанные задачи: ${project.name}` : "Сделанные задачи"}
              </h2>
              <p className="mt-2 text-sm text-slate-600">Здесь собраны задачи проекта, которые уже полностью завершены.</p>
            </div>
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">{doneTasks.length}</span>
          </div>

          {project ? (
            <div className="mt-4">
              <Button asChild variant="secondary">
                <Link to={projectPath(project.id)}>К доске проекта</Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {doneTasks.length > 0 ? (
              doneTasks.map((task) => (
                <TaskCard key={task.id} task={task} actions={<TaskActions task={task} onDeleteClick={deleteTaskModal.open} />} />
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-emerald-300 bg-white/70 p-4 text-sm text-slate-500 sm:col-span-2 xl:col-span-3">
                Сделанных задач пока нет.
              </div>
            )}
          </div>
        </section>
      ) : null}
      <DeleteTaskModal open={deleteTaskModal.isOpen} task={deleteTaskModal.task} onClose={deleteTaskModal.close} />
    </section>
  );
}
