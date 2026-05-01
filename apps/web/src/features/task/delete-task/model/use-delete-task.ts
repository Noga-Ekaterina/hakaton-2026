import { useState } from "react";
import { useDeleteTaskMutation } from "@/app/store/api/tasks-api";
import type { Task } from "@/entities/task";

type UseDeleteTaskParams = {
  task: Task | null;
  onClose: () => void;
  event?: () => void;
};

export function useDeleteTask({ event, onClose, task }: UseDeleteTaskParams) {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!task) {
      return;
    }

    setError(null);

    try {
      await deleteTask({ id: task.id, projectId: task.projectId }).unwrap();
      if (event) {
        event();
        return;
      }

      onClose();
    } catch {
      setError("Не удалось удалить задачу.");
    }
  };

  return {
    error,
    handleClose,
    handleDelete,
    isLoading,
  };
}
