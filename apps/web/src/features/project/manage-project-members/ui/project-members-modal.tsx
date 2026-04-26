import { useState } from "react";
import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useProjectMembersModal } from "../model/use-project-members-modal";
import { useProjectUsersModal } from "../model/use-project-users-modal";
import { ProjectMembersAvailableUsers } from "./project-members-available-users";
import { ProjectMembersUsersList } from "./project-members-users-list";

type ProjectMembersModalProps = {
  open: boolean;
  onClose: () => void;
  project: Project;
  users: User[];
};

type MembersTab = "list" | "add";

export function ProjectMembersModal({ open, onClose, project, users }: ProjectMembersModalProps) {
  const [activeTab, setActiveTab] = useState<MembersTab>("list");
  const addModel = useProjectMembersModal({ open, project, users });
  const listModel = useProjectUsersModal({ open, project, users });

  const isListTab = activeTab === "list";
  const isAddTab = activeTab === "add";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Участники"
      description={`Управляйте составом проекта «${project.name}» в одном окне.`}
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
              isListTab ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Список
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isAddTab ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
            }`}
          >
            Добавить
          </button>
        </div>

        {isListTab ? (
          <ProjectMembersUsersList
            users={listModel.projectUsers}
            isPending={listModel.isPending}
            pendingUserId={listModel.pendingUserId}
            submitError={listModel.submitError}
            onRemoveUser={listModel.removeUser}
          />
        ) : null}

        {isAddTab ? (
          <ProjectMembersAvailableUsers
            users={addModel.availableUsers}
            isPending={addModel.isPending}
            pendingUserId={addModel.pendingUserId}
            submitError={addModel.submitError}
            onAddUser={addModel.addUser}
          />
        ) : null}
      </div>
    </Modal>
  );
}
