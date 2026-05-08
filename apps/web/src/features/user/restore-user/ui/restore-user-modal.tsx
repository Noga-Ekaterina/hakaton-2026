import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { useRestoreUser } from "../model/use-restore-user";

type RestoreUserModalProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export function RestoreUserModal({ onClose, open, user }: RestoreUserModalProps) {
  const { error, handleClose, handleRestore, isLoading } = useRestoreUser({ onClose, user });

  return (
    <Modal
      open={open}
      title="Восстановление пользователя"
      description={user ? `Пользователь #${user.id}: ${user.name}` : undefined}
      onClose={handleClose}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button type="button" onClick={handleRestore} disabled={isLoading || !user}>
            {isLoading ? "Восстанавливаем..." : "Восстановить"}
          </Button>
        </div>
      }
    >
      <p className="text-sm leading-6 text-slate-700">
        Пользователь снова сможет войти в систему и появится в рабочих списках сотрудников.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </Modal>
  );
}
