import { useState } from "react";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useUserProjectsModal } from "../model/use-user-projects-modal";

type UserProjectsModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  projects: Project[];
};

type ProjectRowProps = {
  actionLabel: string;
  isPending: boolean;
  onAction: () => void;
  pendingLabel: string;
  project: Project;
  variant?: "primary" | "secondary";
};

type ProjectsTab = "list" | "add";

function ProjectRow({ actionLabel, isPending, onAction, pendingLabel, project, variant = "secondary" }: ProjectRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <span className="min-w-0 truncate text-sm font-semibold text-slate-950">{project.name}</span>
      <Button type="button" variant={variant} disabled={isPending} onClick={onAction}>
        {isPending ? pendingLabel : actionLabel}
      </Button>
    </div>
  );
}

export function UserProjectsModal({ open, onClose, user, projects }: UserProjectsModalProps) {
  const [activeTab, setActiveTab] = useState<ProjectsTab>("list");
  const { assignedProjects, availableProjects, addProject, removeProject, isProjectPending, submitError } =
    useUserProjectsModal({
      open,
      user,
      projects,
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Проекты пользователя"
      description={`Управляйте проектами пользователя ${user.name} в одном окне.`}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 rounded-full bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "list" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Список
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeTab === "add" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Добавить
          </button>
        </div>

        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        {activeTab === "list" ? <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Назначенные проекты</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {assignedProjects.length}
            </span>
          </div>

          {assignedProjects.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              У пользователя пока нет назначенных проектов.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  actionLabel="Удалить"
                  pendingLabel="Удаляем..."
                  isPending={isProjectPending(project.id, "remove")}
                  onAction={() => removeProject(project)}
                />
              ))}
            </div>
          )}
        </section> : null}

        {activeTab === "add" ? <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Доступные проекты</h3>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {availableProjects.length}
            </span>
          </div>

          {availableProjects.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Все доступные проекты уже назначены этому пользователю.
            </p>
          ) : (
            <div className="space-y-3">
              {availableProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  actionLabel="Добавить"
                  pendingLabel="Добавляем..."
                  variant="primary"
                  isPending={isProjectPending(project.id, "add")}
                  onAction={() => addProject(project)}
                />
              ))}
            </div>
          )}
        </section> : null}
      </div>
    </Modal>
  );
}
