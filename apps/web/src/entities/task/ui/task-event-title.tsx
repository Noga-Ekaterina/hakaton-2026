import type { TaskEvent, TaskEventType } from "../model/types";
import { TaskChangeValue } from "./task-change";

function getEventAction(type: TaskEventType) {
  const labels: Record<TaskEventType, string> = {
    TASK_CREATED: "создал(а) задачу",
    TASK_UPDATED: "изменил(а) задачу",
    STATUS_UPDATED: "изменил(а) статус",
    STORY_POINTS_UPDATED: "изменил(а) story points",
  };

  return labels[type];
}

type TaskEventTitleProps = {
  item: TaskEvent;
  userNameById: Map<number, string>;
};

export function TaskEventTitle({ item, userNameById }: TaskEventTitleProps) {
  const actorName = item.actor?.name ?? "Система";
  const statusChange = item.type === "STATUS_UPDATED" ? item.changes.find((change) => change.field === "status") : undefined;

  if (statusChange) {
    return (
      <span className="inline-flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="shrink-0">
          {actorName} {getEventAction(item.type)}:
        </span>
        <TaskChangeValue field={statusChange.field} value={statusChange.oldValue} userNameById={userNameById} />
        <span className="shrink-0" aria-hidden="true">
          →
        </span>
        <TaskChangeValue field={statusChange.field} value={statusChange.newValue} userNameById={userNameById} />
      </span>
    );
  }

  return (
    <>
      {actorName} {getEventAction(item.type)}
    </>
  );
}
