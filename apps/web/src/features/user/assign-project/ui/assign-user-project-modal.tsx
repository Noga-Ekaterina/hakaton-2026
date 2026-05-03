import type { Project } from "@/entities/project";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { OptionSelect } from "@/shared/ui/option-select";
import { useAssignUserProjectForm } from "../model/use-assign-user-project-form";

type AssignUserProjectModalProps = {
  open: boolean;
  onClose: () => void;
  user: User;
  projects: Project[];
};

export function AssignUserProjectModal({ open, onClose, user, projects }: AssignUserProjectModalProps) {
  const { register, setValue, errors, submit, submitError, isPending, availableProjects, selectedProjectId } =
    useAssignUserProjectForm({
      user,
      projects,
      onClose,
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавить проект"
      description={`Выберите еще один проект для ${user.name}.`}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="assign-user-project-form" disabled={isPending || availableProjects.length === 0}>
            {isPending ? "Сохраняем..." : "Добавить"}
          </Button>
        </div>
      }
    >
      <form id="assign-user-project-form" className="space-y-4" onSubmit={submit} noValidate>
        <input type="hidden" {...register("projectId")} />
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
        {availableProjects.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Все доступные проекты уже прикреплены к этому пользователю.
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor={`assign-project-${user.id}`}>Новый проект</Label>
          <OptionSelect
            id={`assign-project-${user.id}`}
            selectionMode="single"
            clearable={false}
            disabled={availableProjects.length === 0}
            options={availableProjects.map((project) => ({ value: String(project.id), label: project.name }))}
            emptyLabel="Выберите проект"
            value={selectedProjectId}
            onChange={(value) => setValue("projectId", value, { shouldDirty: true, shouldValidate: true })}
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
          {errors.projectId ? <p className="text-sm text-rose-600">{errors.projectId.message}</p> : null}
        </div>
      </form>
    </Modal>
  );
}
