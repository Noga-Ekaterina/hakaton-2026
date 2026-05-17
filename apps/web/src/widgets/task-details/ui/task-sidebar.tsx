import { Link } from "react-router-dom";
import { useMemo } from "react";
import type { CreateTaskMeta } from "@/app/store/api/tasks-api";
import { useAppSelector } from "@/app/store/hooks";
import {
  TaskPriorityBadge,
  TaskStatusBadge,
  TaskTagBadge,
  TaskTagSelect,
  canEditTaskStoryPoints,
  taskPriorityMeta,
  taskStatusMeta,
  type EditableTaskValues,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/entities/task";
import { getUserDisplayName, getUserDisplayOptions } from "@/entities/user";
import { UpdateStoryPointsForm } from "@/features/task/update-story-points";
import { projectPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { OptionSelect } from "@/shared/ui/option-select";

type TaskSidebarProps = {
  isEditing: boolean;
  meta?: CreateTaskMeta;
  projectId: number;
  task: Task;
  values: EditableTaskValues;
  onValuesChange: (values: EditableTaskValues) => void;
};

export function TaskSidebar({ isEditing, meta, onValuesChange, projectId, task, values }: TaskSidebarProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const userOptions = useMemo(() => getUserDisplayOptions(meta?.users ?? [], currentUserId), [currentUserId, meta?.users]);
  const assigneeName = getUserDisplayName({ id: task.assigneeId, name: task.assigneeName }, currentUserId);
  const authorName = getUserDisplayName({ id: task.authorId, name: task.authorName }, currentUserId);
  const canEditStoryPoints = canEditTaskStoryPoints(task, currentUserId);

  return (
    <aside className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <h3 className="text-lg font-black tracking-tight text-slate-950">Story points</h3>
        {canEditStoryPoints ? (
          <UpdateStoryPointsForm task={task} />
        ) : (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
            <span className="text-2xl font-black text-slate-950">{task.storyPoints ?? "Не указаны"}</span>
          </div>
        )}
      </section>
      <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <h3 className="text-lg font-black tracking-tight text-slate-950">Детали</h3>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Статус</dt>
            <dd className="mt-2">
              {isEditing ? (
                <OptionSelect
                  selectionMode="single"
                  clearable={false}
                  value={values.status}
                  onChange={(value) => onValuesChange({ ...values, status: value as TaskStatus })}
                  options={(meta?.taskStatuses ?? []).map((status) => ({
                    value: status,
                    label: taskStatusMeta[status].label,
                    color: taskStatusMeta[status].color,
                  }))}
                  triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
                />
              ) : (
                <TaskStatusBadge status={task.status} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Приоритет</dt>
            <dd className="mt-2">
              {isEditing ? (
                <OptionSelect
                  selectionMode="single"
                  clearable={false}
                  value={values.priority}
                  onChange={(value) => onValuesChange({ ...values, priority: value as TaskPriority })}
                  options={(meta?.taskPriorities ?? []).map((priority) => ({
                    value: priority,
                    label: taskPriorityMeta[priority].label,
                    color: taskPriorityMeta[priority].color,
                  }))}
                  triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
                />
              ) : (
                <TaskPriorityBadge priority={task.priority} />
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Исполнитель</dt>
            <dd className="mt-2">
              {isEditing ? (
                <OptionSelect
                  selectionMode="single"
                  clearable={false}
                  value={String(values.assigneeId)}
                  onChange={(value) => onValuesChange({ ...values, assigneeId: Number(value) })}
                  options={userOptions.map((user) => ({ value: String(user.id), label: user.name }))}
                  triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
                />
              ) : (
                <span className="text-sm font-semibold text-slate-900">{assigneeName}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Автор</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-900">{authorName}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Создана</dt>
            <dd className="mt-2 text-sm font-semibold text-slate-900">{new Date(task.createdAt).toLocaleDateString("ru-RU")}</dd>
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

      <Button asChild variant="secondary" className="w-full">
        <Link to={projectPath(projectId)}>Вернуться на доску</Link>
      </Button>
    </aside>
  );
}
