import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useAssignUserProjectForm } from "../model/use-assign-user-project-form";

type AssignUserProjectModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  projects: Project[];
};

export function AssignUserProjectModal({ open, onClose, user, projects }: AssignUserProjectModalProps) {
  const { register, errors, submit, submitError, isPending } = useAssignUserProjectForm({
    user,
    projects,
    onClose,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Изменить проект"
      description={`Выберите новый проект для ${user.name}.`}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="assign-user-project-form" disabled={isPending}>
            {isPending ? "Сохраняем..." : "Сохранить проект"}
          </Button>
        </div>
      }
    >
      <form id="assign-user-project-form" className="space-y-4" onSubmit={submit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="space-y-2">
          <Label htmlFor={`assign-project-${user.id}`}>Новый проект</Label>
          <select
            id={`assign-project-${user.id}`}
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.projectId)}
            {...register("projectId")}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId ? <p className="text-sm text-rose-600">{errors.projectId.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
