import { useState } from "react";
import { useDeleteProjectMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";

type UseDeleteProjectParams = {
  project: Project | null;
  onClose: () => void;
  onDeleted: () => void;
};

export function useDeleteProject({ onClose, onDeleted, project }: UseDeleteProjectParams) {
  const [deleteProject, { isLoading }] = useDeleteProjectMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!project) {
      return;
    }

    setError(null);

    try {
      await deleteProject({ id: project.id }).unwrap();
      onDeleted();
    } catch {
      setError("Не удалось удалить проект.");
    }
  };

  return {
    error,
    handleClose,
    handleDelete,
    isLoading,
  };
}
