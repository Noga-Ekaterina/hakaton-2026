import type { ReactNode } from "react";
import type { TaskChange } from "../model/types";
import {
  getTaskFieldLabel,
  isTaskPriority,
  isTaskStatus,
} from "../model/task-display";
import { TaskPriorityBadge, TaskStatusBadge } from "./task-badge";

type ChangeTag = {
  id?: number;
  name: string;
  color?: string;
};

function normalizeChangeTags(value: unknown): ChangeTag[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return { name: item };
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const tag = item as Record<string, unknown>;

      if (typeof tag.name !== "string" || tag.name.trim() === "") {
        return null;
      }

      return {
        id: typeof tag.id === "number" ? tag.id : undefined,
        name: tag.name,
        color: typeof tag.color === "string" ? tag.color : undefined,
      };
    })
    .filter((tag): tag is ChangeTag => tag !== null);
}

function TaskChangeTagBadges({ value }: { value: unknown }) {
  const tags = normalizeChangeTags(value);

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {tags.map((tag, index) => {
        const color = tag.color ?? "#64748b";

        return (
          <span
            key={`${tag.id ?? tag.name}-${index}`}
            className="inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold"
            style={{ borderColor: color, color: "#ffffff", backgroundColor: color }}
          >
            {tag.name}
          </span>
        );
      })}
    </span>
  );
}

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
  const isTagsChange = change.field === "tagsAdded" || change.field === "tagsRemoved";

  if (isTagsChange) {
    const value = change.field === "tagsAdded" ? change.newValue : change.oldValue;

    return (
      <span className="inline-flex flex-wrap items-center gap-2">
        <span>{getTaskFieldLabel(change.field)}:</span>
        <TaskChangeTagBadges value={value} />
      </span>
    );
  }

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
