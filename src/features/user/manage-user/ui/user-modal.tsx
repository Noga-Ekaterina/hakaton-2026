import type { Department } from "@/entities/department";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useUserModalForm } from "../model/use-user-modal-form";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  user?: User | null;
};

export function UserModal({ open, onClose, departments, user }: UserModalProps) {
  const { register, errors, submit, submitError, isPending, title, description, primaryLabel } = useUserModalForm({
    open,
    onClose,
    departments,
    user,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="user-modal-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : primaryLabel}
          </Button>
        </div>
      }
    >
      <form id="user-modal-form" className="grid gap-5 md:grid-cols-2" onSubmit={submit} noValidate>
        {submitError ? <p className="md:col-span-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="user-name">Имя</Label>
          <Input id="user-name" placeholder="Иван Петров" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input id="user-email" type="email" placeholder="user@company.ru" aria-invalid={Boolean(errors.email)} {...register("email")} />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Роль</Label>
          <select
            id="user-role"
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.role)}
            {...register("role")}
          >
            <option value="EMPLOYEE">Сотрудник</option>
            <option value="MANAGER">Менеджер</option>
          </select>
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-department">Отдел</Label>
          <select
            id="user-department"
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.departmentId)}
            {...register("departmentId")}
          >
            <option value="">Выберите отдел</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          {errors.departmentId ? <p className="text-sm text-rose-600">{errors.departmentId.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
