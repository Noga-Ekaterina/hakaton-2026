import type { TaskListItem } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useDeleteTask } from "../model/use-delete-task";

type DeleteTaskModalProps = {
  open: boolean;
  task: TaskListItem | null;
  onClose: () => void;
  event?: () => void;
};

export function DeleteTaskModal({ open, task, onClose, event }: DeleteTaskModalProps) {
  const { error, handleClose, handleDelete, isLoading } = useDeleteTask({ event, onClose, task });

  return (
    <Modal
      open={open}
      title="Удаление задачи"
      description={task ? `Задача #${task.id}: ${task.title}` : undefined}
      onClose={handleClose}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete} disabled={isLoading || !task}>
            {isLoading ? "Удаляем..." : "Удалить"}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-700">Вы действительно хотите удалить задачу?</p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </Modal>
  );
}
