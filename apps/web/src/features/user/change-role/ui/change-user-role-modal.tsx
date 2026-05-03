import type { User, UserRole } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { OptionSelect } from "@/shared/ui/option-select";
import { useChangeUserRoleForm } from "../model/use-change-user-role-form";

type ChangeUserRoleModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
};

const roleOptions = [
  { value: "USER", label: "Пользователь" },
  { value: "ADMIN", label: "Администратор" },
] satisfies Array<{ value: UserRole; label: string }>;

export function ChangeUserRoleModal({ open, onClose, user }: ChangeUserRoleModalProps) {
  const { register, setValue, errors, submit, submitError, isPending, selectedRole } = useChangeUserRoleForm({ user, onClose });

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
        <input type="hidden" {...register("role")} />
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor={`change-role-${user.id}`}>Новая роль</Label>
          <OptionSelect
            id={`change-role-${user.id}`}
            selectionMode="single"
            clearable={false}
            value={selectedRole}
            onChange={(value) => setValue("role", value as UserRole, { shouldDirty: true, shouldValidate: true })}
            options={roleOptions}
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
