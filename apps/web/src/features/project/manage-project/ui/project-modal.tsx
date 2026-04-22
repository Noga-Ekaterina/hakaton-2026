import type { Project } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useProjectModalForm } from "../model/use-project-modal-form";

type ProjectModalProps = {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
};

export function ProjectModal({ open, onClose, project }: ProjectModalProps) {
  const { register, errors, submit, submitError, isPending, title, description, primaryLabel } =
    useProjectModalForm({
      open,
      onClose,
      project,
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
          <Button type="submit" form="project-modal-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : primaryLabel}
          </Button>
        </div>
      }
    >
      <form id="project-modal-form" className="space-y-5" onSubmit={submit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor="project-name">Название проекта</Label>
          <Input
            id="project-name"
            placeholder="Например, Операционный"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
