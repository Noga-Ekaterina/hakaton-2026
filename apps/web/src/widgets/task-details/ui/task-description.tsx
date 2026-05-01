import type { EditableTaskValues, Task } from "@/entities/task";

type TaskDescriptionProps = {
  isEditing: boolean;
  task: Task;
  values: EditableTaskValues;
  onValuesChange: (values: EditableTaskValues) => void;
};

export function TaskDescription({ isEditing, onValuesChange, task, values }: TaskDescriptionProps) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <h3 className="text-xl font-black tracking-tight text-slate-950">Описание</h3>
      {isEditing ? (
        <textarea
          className="mt-4 min-h-44 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          value={values.description}
          onChange={(event) => onValuesChange({ ...values, description: event.target.value })}
        />
      ) : task.description ? (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{task.description}</p>
      ) : (
        <p className="mt-4 text-sm text-slate-500">Описание пока не добавлено.</p>
      )}
    </section>
  );
}
