import type { Project } from "@/entities/project";
import type { UserRole } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { OptionSelect } from "@/shared/ui/option-select";
import { useUserModalForm } from "../model/use-user-modal-form";

type UserModalProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
};

const roleOptions = [
  { value: "USER", label: "Пользователь" },
  { value: "ADMIN", label: "Администратор" },
] satisfies Array<{ value: UserRole; label: string }>;

export function UserModal({ open, onClose, projects }: UserModalProps) {
  const { register, setValue, errors, submit, submitError, isPending, selectedProjectId, selectedRole } = useUserModalForm({
    open,
    onClose,
    projects,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Создать пользователя"
      description="Можно указать имя, email, пароль, роль и проект в одном окне."
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form="user-modal-form" disabled={isPending}>
            {isPending ? "Создаем..." : "Создать пользователя"}
          </Button>
        </div>
      }
    >
      <form id="user-modal-form" className="grid gap-5 md:grid-cols-2" onSubmit={submit} noValidate>
        <input type="hidden" {...register("role")} />
        <input type="hidden" {...register("projectId")} />
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 md:col-span-2">{submitError}</p> : null}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user-name">Имя</Label>
          <Input id="user-name" placeholder="Иван Петров" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="user@company.ru"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="user-password">Пароль</Label>
          <Input
            id="user-password"
            type="password"
            autoComplete="new-password"
            placeholder="Минимум 6 символов"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Роль</Label>
          <OptionSelect
            id="user-role"
            selectionMode="single"
            clearable={false}
            value={selectedRole}
            onChange={(value) => setValue("role", value as UserRole, { shouldDirty: true, shouldValidate: true })}
            options={roleOptions}
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>

        {selectedRole === "ADMIN" ? null : (
          <div className="space-y-2">
            <Label htmlFor="user-project">Проект</Label>
            <OptionSelect
              id="user-project"
              selectionMode="single"
              clearable={false}
              options={projects.map((project) => ({ value: String(project.id), label: project.name }))}
              emptyLabel="Выберите проект"
              value={selectedProjectId ?? ""}
              onChange={(value) => setValue("projectId", value, { shouldDirty: true, shouldValidate: true })}
              triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
            />
            {errors.projectId ? <p className="text-sm text-rose-600">{errors.projectId.message}</p> : null}
          </div>
        )}
      </form>
    </Modal>
  );
}
