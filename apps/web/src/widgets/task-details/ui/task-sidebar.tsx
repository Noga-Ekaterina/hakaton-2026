import { Link } from "react-router-dom";
import type { CreateTaskMeta } from "@/app/store/api/tasks-api";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
  TaskTagBadge,
  TaskTagSelect,
  taskPriorityLabels,
  taskStatusLabels,
  type EditableTaskValues,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/entities/task";
import { UpdateStoryPointsForm } from "@/features/task/update-story-points";
import { projectPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

type TaskSidebarProps = {
  isEditing: boolean;
  meta?: CreateTaskMeta;
  projectId: number;
  task: Task;
  values: EditableTaskValues;
  onValuesChange: (values: EditableTaskValues) => void;
};

export function TaskSidebar({ isEditing, meta, onValuesChange, projectId, task, values }: TaskSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <h3 className="text-lg font-black tracking-tight text-slate-950">Детали</h3>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Статус</dt>
            <dd className="mt-2">
              {isEditing ? (
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={values.status}
                  onChange={(event) => onValuesChange({ ...values, status: event.target.value as TaskStatus })}
                >
                  {meta?.taskStatuses.map((status) => (
                    <option key={status} value={status}>
                      {taskStatusLabels[status]}
                    </option>
                  ))}
                </select>
              ) : (
                <TaskStatusBadge status={task.status} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Приоритет</dt>
            <dd className="mt-2">
              {isEditing ? (
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={values.priority}
                  onChange={(event) => onValuesChange({ ...values, priority: event.target.value as TaskPriority })}
                >
                  {meta?.taskPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {taskPriorityLabels[priority]}
                    </option>
                  ))}
                </select>
              ) : (
                <TaskPriorityBadge priority={task.priority} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Исполнитель</dt>
            <dd className="mt-2">
              {isEditing ? (
                <select
                  className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={values.assigneeId}
                  onChange={(event) => onValuesChange({ ...values, assigneeId: Number(event.target.value) })}
                >
                  {meta?.users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-semibold text-slate-900">{task.assigneeName}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Автор</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-900">{task.authorName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Создана</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-900">{new Date(task.createdAt).toLocaleDateString("ru-RU")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Story points</dt>
            <dd className="mt-2">
              {isEditing ? (
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={values.storyPoints}
                  onChange={(event) => onValuesChange({ ...values, storyPoints: event.target.value })}
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900">{task.storyPoints ?? "Не указаны"}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Теги</dt>
            <dd className="mt-2">
              {isEditing ? (
                <TaskTagSelect
                  tags={meta?.tags ?? []}
                  value={values.tagIds}
                  onChange={(tagIds) => onValuesChange({ ...values, tagIds })}
                />
              ) : task.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <TaskTagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              ) : (
                <span className="text-sm font-semibold text-slate-900">Не указаны</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      {!isEditing ? (
        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <h3 className="text-lg font-black tracking-tight text-slate-950">Story points</h3>
          <UpdateStoryPointsForm task={task} />
        </section>
      ) : null}

      <Button asChild variant="secondary" className="w-full">
        <Link to={projectPath(projectId)}>Вернуться на доску</Link>
      </Button>
    </aside>
  );
}
