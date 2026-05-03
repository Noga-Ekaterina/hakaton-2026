import { TaskCard } from "@/entities/task";
import type { TaskListItem, TaskStatus } from "@/entities/task";
import { TaskActions } from "@/features/task/task-actions";
import { UpdateStoryPointsForm } from "@/features/task/update-story-points";
import { useTaskColumnDrop } from "../model/use-task-column-drop";

type TaskColumnProps = {
  title: string;
  description: string;
  statuses: TaskStatus[];
  accent: string;
  tasks: TaskListItem[];
  onMoveTask: (taskId: number, status: TaskStatus) => void;
  onDeleteTask: (task: TaskListItem) => void;
};

export function TaskColumn({ title, description, statuses, accent, tasks, onMoveTask, onDeleteTask }: TaskColumnProps) {
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
      <div className="p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 xl:text-2xl">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{tasks.length}</span>
        </div>

        <div className="mt-5 space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                actions={<TaskActions task={task} onDeleteClick={onDeleteTask} />}
                footer={
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Story points</h4>
                    <UpdateStoryPointsForm task={task} />
                  </div>
                }
              />
            ))
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
