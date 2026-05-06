import type { Project } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useDeleteProject } from "../model/use-delete-project";

type DeleteProjectModalProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function DeleteProjectModal({ onClose, onDeleted, open, project }: DeleteProjectModalProps) {
  const { error, handleClose, handleDelete, isLoading } = useDeleteProject({ onClose, onDeleted, project });

  return (
    <Modal
      open={open}
      title="Удаление проекта"
      description={project ? `Проект #${project.id}: ${project.name}` : undefined}
      onClose={handleClose}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete} disabled={isLoading || !project}>
            {isLoading ? "Удаляем..." : "Удалить"}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-700">
        Проект будет удален вместе со всеми задачами, тегами, комментариями, событиями и файлами фотографий. Пользователи останутся в системе.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </Modal>
  );
}
