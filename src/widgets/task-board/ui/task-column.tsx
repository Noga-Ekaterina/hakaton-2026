import { TaskCard } from "@/entities/task";
import type { Task, TaskStatus } from "@/entities/task";
import { useTaskColumnDrop } from "../model/use-task-column-drop";

type TaskColumnProps = {
  title: string;
  description: string;
  statuses: TaskStatus[];
  accent: string;
  tasks: Task[];
  onMoveTask: (taskId: number, status: TaskStatus) => void;
};

export function TaskColumn({ title, description, statuses, accent, tasks, onMoveTask }: TaskColumnProps) {
  const targetStatus = statuses[0];
  const [{ isOver, canDrop }, dropRef] = useTaskColumnDrop({ targetStatus, onMoveTask });

  return (
    <div
      ref={dropRef}
      className={`min-w-0 overflow-hidden rounded-[2rem] border bg-white/55 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm transition ${
        isOver && canDrop ? "border-cyan-300 ring-2 ring-cyan-300/60" : "border-slate-200/80"
      }`}
    >
      <div className={`h-2 bg-gradient-to-r ${accent}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{tasks.length}</span>
        </div>

        <div className="mt-5 space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
              Здесь пока пусто.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
