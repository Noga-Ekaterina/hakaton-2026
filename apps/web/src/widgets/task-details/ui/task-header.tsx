import type { ReactNode } from "react";
import { ArrowLeftIcon, Pencil1Icon } from "@radix-ui/react-icons";
import type { EditableTaskValues, Task } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

type TaskHeaderProps = {
  actions?: ReactNode;
  isEditing: boolean;
  isUpdating: boolean;
  submitError: string | null;
  task: Task;
  values: EditableTaskValues;
  onBack: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onStartEdit: () => void;
  onValuesChange: (values: EditableTaskValues) => void;
};

export function TaskHeader({
  actions,
  isEditing,
  isUpdating,
  onBack,
  onCancelEdit,
  onSave,
  onStartEdit,
  onValuesChange,
  submitError,
  task,
  values,
}: TaskHeaderProps) {
  return (
    <>
      <Button type="button" variant="ghost" className="gap-2 px-0 hover:bg-transparent" onClick={onBack}>
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        К доске проекта
      </Button>

      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Задача #{task.id}</p>
            {isEditing ? (
              <div className="mt-3 max-w-3xl">
                <Label htmlFor="task-edit-title">Название</Label>
                <Input
                  id="task-edit-title"
                  className="mt-2"
                  value={values.title}
                  onChange={(event) => onValuesChange({ ...values, title: event.target.value })}
                />
              </div>
            ) : (
              <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950">{task.title}</h2>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <Button type="button" variant="secondary" onClick={onCancelEdit} disabled={isUpdating}>
                  Отмена
                </Button>
                <Button type="button" onClick={onSave} disabled={isUpdating}>
                  {isUpdating ? "Сохраняем..." : "Сохранить"}
                </Button>
              </>
            ) : (
              <>
                {actions}
                <Button type="button" className="gap-2" onClick={onStartEdit}>
                  <Pencil1Icon className="h-4 w-4" aria-hidden="true" />
                  Редактировать
                </Button>
              </>
            )}
          </div>
        </div>
        {submitError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
      </section>
    </>
  );
}
