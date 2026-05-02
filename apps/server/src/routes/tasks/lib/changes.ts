import type { Prisma } from "@prisma/client";
import type { TaskChange } from "@hakaton/shared";

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    author: true;
    assignee: true;
    project: true;
    images: true;
    tags: true;
  };
}>;

function addChange(changes: TaskChange[], field: string, oldValue: unknown, newValue: unknown) {
  if (oldValue === newValue) {
    return;
  }

  changes.push({
    field,
    oldValue,
    newValue,
  });
}

function areNumberArraysEqual(left: number[], right: number[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function buildTaskUpdateChanges(
  existing: TaskWithRelations,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assigneeId?: number;
    storyPoints?: number | null;
    tagIds?: number[];
  },
) {
  const changes: TaskChange[] = [];

  addChange(changes, "title", existing.title, data.title);
  addChange(changes, "description", existing.description, data.description);
  addChange(changes, "priority", existing.priority, data.priority);
  addChange(changes, "assigneeId", existing.assigneeId, data.assigneeId);

  if (data.tagIds) {
    const oldTagIds = existing.tags.map((tag) => tag.id).sort((left, right) => left - right);
    const newTagIds = [...data.tagIds].sort((left, right) => left - right);

    if (!areNumberArraysEqual(oldTagIds, newTagIds)) {
      changes.push({ field: "tagIds", oldValue: oldTagIds, newValue: newTagIds });
    }
  }

  return changes.filter((change) => typeof change.newValue !== "undefined");
}

export function buildSingleChange(field: string, oldValue: unknown, newValue: unknown) {
  if (typeof newValue === "undefined" || oldValue === newValue) {
    return null;
  }

  return {
    field,
    oldValue,
    newValue,
  };
}
