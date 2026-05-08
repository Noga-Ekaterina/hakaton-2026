import { useState } from "react";
import { useRestoreUserMutation } from "@/app/store/api/admin-api";
import type { User } from "@/entities/user";

type UseRestoreUserParams = {
  user: User | null;
  onClose: () => void;
};

export function useRestoreUser({ onClose, user }: UseRestoreUserParams) {
  const [restoreUser, { isLoading }] = useRestoreUserMutation();
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) {
      return;
    }

    setError(null);
    onClose();
  };

  const handleRestore = async () => {
    if (!user) {
      return;
    }

    setError(null);

    try {
      await restoreUser({ id: user.id }).unwrap();
      onClose();
    } catch {
      setError("Не удалось восстановить пользователя.");
    }
  };

  return {
    error,
    handleClose,
    handleRestore,
    isLoading,
  };
}
