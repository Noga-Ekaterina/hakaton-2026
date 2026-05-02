import type { ReactNode } from "react";
import type { TaskPriority, TaskStatus, TaskTag } from "../model/types";
import { taskPriorityMeta, taskStatusMeta } from "../model/task-meta";

type TaskBadgeProps = {
  className: string;
  children: ReactNode;
};

export function TaskBadge({ className, children }: TaskBadgeProps) {
  return <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <TaskBadge className={taskStatusMeta[status].className}>{taskStatusMeta[status].label}</TaskBadge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <TaskBadge className={taskPriorityMeta[priority].className}>{taskPriorityMeta[priority].label}</TaskBadge>;
}

export function TaskTagBadge({ tag }: { tag: TaskTag }) {
  return (
    <span
      className="inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ borderColor: tag.color, color: "#ffffff", backgroundColor: tag.color }}
    >
      {tag.name}
    </span>
  );
}
