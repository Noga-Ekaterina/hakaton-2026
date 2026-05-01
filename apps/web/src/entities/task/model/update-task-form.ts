import type { Task, TaskPriority, TaskStatus } from "./types";

export type EditableTaskValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: number;
  storyPoints: string;
  keepImageIds: number[];
  photos: File[];
};

export type UpdateTaskFormInput = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: number;
  storyPoints: number | null;
  keepImageIds: number[];
  photos: File[];
};

export function getEditableTaskValues(task: Task): EditableTaskValues {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assigneeId: task.assigneeId,
    storyPoints: task.storyPoints === null ? "" : String(task.storyPoints),
    keepImageIds: task.images.map((image) => image.id),
    photos: [],
  };
}

export function parseTaskStoryPoints(value: string) {
  const trimmed = value.trim();

  return trimmed === "" ? null : Number(trimmed);
}

export function buildUpdateTaskInput(values: EditableTaskValues): UpdateTaskFormInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    assigneeId: values.assigneeId,
    storyPoints: parseTaskStoryPoints(values.storyPoints),
    keepImageIds: values.keepImageIds,
    photos: values.photos,
  };
}
