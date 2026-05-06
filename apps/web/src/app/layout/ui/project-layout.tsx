import { useState } from "react";
import { Navigate, Outlet, useMatch, useNavigate } from "react-router-dom";
import { ProjectNav } from "@/app/layout/ui/project-nav";
import { DeleteProjectModal } from "@/features/project/delete-project";
import { ProjectModal } from "@/features/project/manage-project";
import { ProjectMembersModal } from "@/features/project/manage-project-members";
import { ProjectTagsModal } from "@/features/project/manage-project-tags";
import { CreateTaskModal } from "@/features/task/create-task";
import { paths } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { TaskFiltersPanel } from "@/widgets/task-filters";
import { useProjectLayoutModel } from "../model";

export function ProjectLayout() {
  const navigate = useNavigate();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
    return <Navigate to={paths.home} replace />;
  }

  const handleProjectDeleted = () => {
    setIsDeleteOpen(false);
    navigate(paths.home, { replace: true });
  };

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
                    <Button
                      type="button"
                      variant="secondary"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50"
                      onClick={() => setIsDeleteOpen(true)}
                    >
                      Удалить проект
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
      <DeleteProjectModal
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDeleted={handleProjectDeleted}
        project={project}
      />
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
