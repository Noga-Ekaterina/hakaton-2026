import type { Task, TaskListItem } from "./types";

type StoryPointsEditableTask = Pick<Task | TaskListItem, "authorId" | "assigneeId">;

export function canEditTaskStoryPoints(task: StoryPointsEditableTask, userId: number | null) {
  return userId !== null && (task.authorId === userId || task.assigneeId === userId);
}
