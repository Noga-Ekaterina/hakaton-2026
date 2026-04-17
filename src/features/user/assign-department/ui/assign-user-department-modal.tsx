import type { Department } from "@/entities/department";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useAssignUserDepartmentForm } from "../model/use-assign-user-department-form";

type AssignUserDepartmentModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  departments: Department[];
};

export function AssignUserDepartmentModal({ open, onClose, user, departments }: AssignUserDepartmentModalProps) {
  const { register, errors, submit, submitError, isPending } = useAssignUserDepartmentForm({
    user,
    departments,
    onClose,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Изменить отдел"
      description={`Выберите новый отдел для ${user.name}.`}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="assign-user-department-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : "Сохранить отдел"}
          </Button>
        </div>
      }
    >
      <form id="assign-user-department-form" className="space-y-4" onSubmit={submit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor={`assign-department-${user.id}`}>Новый отдел</Label>
          <select
            id={`assign-department-${user.id}`}
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
