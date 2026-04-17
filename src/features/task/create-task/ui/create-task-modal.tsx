import { createPortal } from "react-dom";
import { UserSelect } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useCreateTaskModal } from "../model/use-create-task-modal";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const { meta, register, errors, isLoading, isError, isSubmitting, submitError, submit } = useCreateTaskModal({
    open,
    onClose,
  });

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Закрыть форму создания задачи"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        type="button"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_120px_rgba(15,23,42,0.24)]"
      >
        <div className="border-b border-slate-200 bg-gradient-to-br from-orange-50 to-white px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Новая задача</p>
              <h2 id="create-task-title" className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Создать задачу
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Заполните основные поля, и задача появится на доске после сохранения.
              </p>
            </div>

            <Button type="button" variant="ghost" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>

        <form className="grid gap-5 p-6" onSubmit={submit} noValidate>
          {isLoading ? <p className="text-sm text-slate-600">Загружаем параметры формы...</p> : null}
          {isError ? <p className="text-sm text-rose-600">Не удалось загрузить параметры формы.</p> : null}
          {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-title">Название</Label>
              <Input
                id="task-title"
                placeholder="Например, подготовить отчет"
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-description">Краткое описание</Label>
              <textarea
                id="task-description"
                className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Несколько слов о сути задачи"
                aria-invalid={Boolean(errors.description)}
                {...register("description")}
              />
              {errors.description ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">Приоритет</Label>
              <select
                id="task-priority"
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-invalid={Boolean(errors.priority)}
                {...register("priority")}
              >
                {meta?.taskPriorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                )) ?? (
                  <>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </>
                )}
              </select>
              {errors.priority ? <p className="text-sm text-rose-600">{errors.priority.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-deadline">Дедлайн</Label>
              <Input id="task-deadline" type="datetime-local" aria-invalid={Boolean(errors.deadline)} {...register("deadline")} />
              {errors.deadline ? <p className="text-sm text-rose-600">{errors.deadline.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-assignee">Исполнитель</Label>
              <UserSelect id="task-assignee" users={meta?.users ?? []} {...register("assigneeId")} />
              {errors.assigneeId ? <p className="text-sm text-rose-600">{errors.assigneeId.message}</p> : null}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="task-department">Подразделение</Label>
              <select
                id="task-department"
                className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-invalid={Boolean(errors.departmentId)}
                {...register("departmentId")}
              >
                <option value="">Выберите подразделение</option>
                {meta?.departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.departmentId ? <p className="text-sm text-rose-600">{errors.departmentId.message}</p> : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Сохраняем..." : "Создать задачу"}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
