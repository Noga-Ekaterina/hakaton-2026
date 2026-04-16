import type { Department } from "@/entities/department";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useDepartmentModalForm } from "../model/use-department-modal-form";

type DepartmentModalProps = {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
};

export function DepartmentModal({ open, onClose, department }: DepartmentModalProps) {
  const { register, errors, submit, submitError, isPending, title, description, primaryLabel } =
    useDepartmentModalForm({
      open,
      onClose,
      department,
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
          <Button type="submit" form="department-modal-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : primaryLabel}
          </Button>
        </div>
      }
    >
      <form id="department-modal-form" className="space-y-5" onSubmit={submit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="department-name">Название отдела</Label>
          <Input
            id="department-name"
            placeholder="Например, Финансы"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
