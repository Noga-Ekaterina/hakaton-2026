import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
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
            <div className="flex flex-wrap items-start justify-between gap-y-4 gap-x-2">
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
                <Button type="button" onClick={() => setIsCreateTaskOpen(true)}>
                  Создать задачу
                </Button>
                {currentUser?.role === "ADMIN" ? (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-10 w-10 px-0"
                        aria-label="Действия проекта"
                      >
                        <DotsHorizontalIcon className="h-5 w-5" aria-hidden="true" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        sideOffset={8}
                        className="z-[60] min-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_70px_rgba(15,23,42,0.18)]"
                      >
                        <DropdownMenu.Item
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition hover:bg-slate-50 focus:bg-slate-50"
                          onSelect={() => setIsRenameOpen(true)}
                        >
                          Переименовать проект
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-rose-700 outline-none transition hover:bg-rose-50 focus:bg-rose-50"
                          onSelect={() => setIsDeleteOpen(true)}
                        >
                          Удалить проект
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse flex-wrap-reverse gap-5 lg:flex-row lg:items-start lg:justify-between">
            <TaskFiltersPanel />
            <ProjectNav currentProjectId={projectId} />
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
