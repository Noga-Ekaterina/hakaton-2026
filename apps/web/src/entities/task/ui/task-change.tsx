import type { ReactNode } from "react";
import type { TaskChange } from "../model/types";
import {
  getTaskFieldLabel,
  isTaskPriority,
  isTaskStatus,
} from "../model/task-display";
import { TaskPriorityBadge, TaskStatusBadge } from "./task-badge";

function formatChangeValue(field: string, value: unknown, userNameById: Map<number, string>): ReactNode {
  if (value === null || typeof value === "undefined" || value === "") {
    return "не указано";
  }

  if (field === "status" && isTaskStatus(value)) {
    return <TaskStatusBadge status={value} />;
  }

  if (field === "priority" && isTaskPriority(value)) {
    return <TaskPriorityBadge priority={value} />;
  }

  if (field === "assigneeId" && typeof value === "number") {
    return userNameById.get(value) ?? `#${value}`;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} файл(ов)` : "нет файлов";
  }

  return String(value);
}

type TaskChangeLineProps = {
  change: TaskChange;
  userNameById: Map<number, string>;
};

export function TaskChangeLine({ change, userNameById }: TaskChangeLineProps) {
  const isStatusChange = change.field === "status";

  return (
    <span className={`inline-flex items-center gap-2 ${isStatusChange ? "max-w-full overflow-x-auto whitespace-nowrap" : "flex-wrap"}`}>
      <span className={isStatusChange ? "shrink-0" : undefined}>{getTaskFieldLabel(change.field)}:</span>
      {formatChangeValue(change.field, change.oldValue, userNameById)}
      <span className={isStatusChange ? "shrink-0" : undefined} aria-hidden="true">
        →
      </span>
      {formatChangeValue(change.field, change.newValue, userNameById)}
    </span>
  );
}

export function TaskChangeValue({
  field,
  value,
  userNameById,
}: {
  field: string;
  value: unknown;
  userNameById: Map<number, string>;
}) {
  return formatChangeValue(field, value, userNameById);
}
