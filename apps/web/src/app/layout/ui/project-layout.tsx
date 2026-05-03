import { useState } from "react";
import { Link, Navigate, Outlet, useMatch } from "react-router-dom";
import { CreateTaskModal } from "@/features/task/create-task";
import { ProjectModal } from "@/features/project/manage-project";
import { ProjectMembersModal } from "@/features/project/manage-project-members";
import { ProjectTagsModal } from "@/features/project/manage-project-tags";
import { Button } from "@/shared/ui/button";
import { paths } from "@/shared/config/routes";
import { ProjectNav } from "./project-nav";
import { TaskFiltersPanel } from "@/widgets/task-filters";
import { useProjectLayoutModel } from "../model";

export function ProjectLayout() {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const isTaskPage = Boolean(useMatch(paths.taskDetail));
  const {
    currentUser,
    projectId,
    project,
    users,
    memberCount,
    projectsLoading,
    projectsError,
    projectsErrorMessage,
    hasAccess,
  } = useProjectLayoutModel();

  if (!Number.isInteger(projectId)) {
    return <Navigate to={paths.home} replace />;
  }

  if (!hasAccess) {
    return <Navigate to={paths.home} replace />;
  }

  if (projectsLoading) {
    return <p className="text-sm text-slate-600">Загружаем проект...</p>;
  }

  if (projectsError) {
    return (
      <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        Не удалось загрузить проект.
        {projectsErrorMessage ? <div className="mt-2 text-sm text-rose-700">{projectsErrorMessage}</div> : null}
      </section>
    );
  }

  if (!project) {
    return (
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Проект</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Проект не найден</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Возможно, ссылка устарела или у вас нет доступа к этому проекту.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to={paths.home}>Вернуться к списку</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      {!isTaskPage ? (
        <div className="space-y-6 border-b border-slate-200/70 pb-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Проект #{project.id}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">{project.name}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Здесь собрана доска задач этого проекта. Фильтры сверху страницы продолжают работать как и раньше.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" type="button" onClick={() => setIsMembersOpen(true)}>
                Участники ({memberCount})
              </Button>
              <Button variant="secondary" type="button" onClick={() => setIsTagsOpen(true)}>
                Теги
              </Button>
              {currentUser?.role === "ADMIN" ? (
                <>
                  <Button type="button" onClick={() => setIsRenameOpen(true)}>
                    Переименовать проект
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse flex-wrap-reverse gap-5 lg:flex-row lg:items-start lg:justify-between">
          <TaskFiltersPanel />
          <ProjectNav currentProjectId={projectId} onCreateTask={() => setIsCreateTaskOpen(true)} />
        </div>
        </div>
      ) : null}

      <main className="pb-16 pt-8">
        <Outlet />
      </main>

      <CreateTaskModal open={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
      <ProjectModal open={isRenameOpen} onClose={() => setIsRenameOpen(false)} project={project} />
      <ProjectTagsModal open={isTagsOpen} onClose={() => setIsTagsOpen(false)} project={project} />
      <ProjectMembersModal
        open={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        project={project}
        users={users ?? []}
        canManageMembers={currentUser?.role === "ADMIN"}
      />
    </>
  );
}
