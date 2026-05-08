import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useDeleteUser } from "../model/use-delete-user";

type DeleteUserModalProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export function DeleteUserModal({ onClose, open, user }: DeleteUserModalProps) {
  const { error, handleClose, handleDelete, isLoading } = useDeleteUser({ onClose, user });

  return (
    <Modal
      open={open}
      title="Удаление пользователя"
      description={user ? `Пользователь #${user.id}: ${user.name}` : undefined}
      onClose={handleClose}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="button" className="bg-rose-600 hover:bg-rose-700" onClick={handleDelete} disabled={isLoading || !user}>
            {isLoading ? "Удаляем..." : "Удалить"}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-700">
        Пользователь будет перенесен в архив и не сможет войти в систему. Задачи, комментарии и история изменений останутся в проекте.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </Modal>
  );
}
