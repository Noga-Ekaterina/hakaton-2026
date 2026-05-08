import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetProjectsQuery } from "@/app/store/api/admin-api";
import { useAppSelector } from "@/app/store/hooks";
import { ProjectCard } from "@/entities/project";
import { ProjectModal } from "@/features/project/manage-project";
import { projectPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

export function HomePage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsFetchError } =
    useGetProjectsQuery();
  const visibleProjects = projects ?? [];

  const totalVisibleProjects = visibleProjects.length;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Проекты</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Список проектов</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Администратор видит все проекты, а обычный сотрудник только те, к которым он привязан.
            </p>
          </div>

          {currentUser?.role === "ADMIN" ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              Создать проект
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Доступно</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{totalVisibleProjects}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Роль</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{currentUser?.role ?? "USER"}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Пользователь</p>
            <p className="mt-3 text-lg font-bold text-slate-950">{currentUser?.name ?? "-"}</p>
          </div>
        </div>
      </div>

      {projectsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить проекты.
          {typeof projectsFetchError === "object" && projectsFetchError && "data" in projectsFetchError ? (
            <div className="mt-2 text-sm text-rose-700">{String(projectsFetchError.data)}</div>
          ) : null}
        </section>
      ) : null}

      {projectsLoading ? <p className="text-sm text-slate-600">Загружаем проекты...</p> : null}

      {!projectsLoading && visibleProjects.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Проектов пока нет</p>
          <p className="mt-2 text-sm">
            {currentUser?.role === "ADMIN"
              ? "Создайте первый проект, чтобы команда могла перейти к задачам."
              : "У вас пока нет доступных проектов."}
          </p>
        </section>
      ) : null}

      {visibleProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              memberCount={project.memberCount}
              onClick={() => navigate(projectPath(project.id))}
            />
          ))}
        </div>
      ) : null}

      <ProjectModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </section>
  );
}
