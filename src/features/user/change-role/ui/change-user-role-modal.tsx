import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useChangeUserRoleForm } from "../model/use-change-user-role-form";

type ChangeUserRoleModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
};

export function ChangeUserRoleModal({ open, onClose, user }: ChangeUserRoleModalProps) {
  const { register, errors, submit, submitError, isPending } = useChangeUserRoleForm({ user, onClose });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Изменить роль"
      description={`Выберите новую роль для ${user.name}.`}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="change-user-role-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : "Сохранить роль"}
          </Button>
        </div>
      }
    >
      <form id="change-user-role-form" className="space-y-4" onSubmit={submit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor={`change-role-${user.id}`}>Новая роль</Label>
          <select
            id={`change-role-${user.id}`}
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.role)}
            {...register("role")}
          >
            <option value="USER">Пользователь</option>
            <option value="ADMIN">Администратор</option>
          </select>
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
