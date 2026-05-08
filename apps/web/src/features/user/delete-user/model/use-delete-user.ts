import { useState } from "react";
import { useDeleteUserMutation } from "@/app/store/api/admin-api";
import type { User } from "@/entities/user";

type UseDeleteUserParams = {
  user: User | null;
  onClose: () => void;
};

export function useDeleteUser({ onClose, user }: UseDeleteUserParams) {
  const [deleteUser, { isLoading }] = useDeleteUserMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!user) {
      return;
    }

    setError(null);

    try {
      await deleteUser({ id: user.id }).unwrap();
      onClose();
    } catch {
      setError("Не удалось удалить пользователя.");
    }
  };

  return {
    error,
    handleClose,
    handleDelete,
    isLoading,
  };
}
