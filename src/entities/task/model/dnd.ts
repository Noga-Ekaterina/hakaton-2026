import type { TaskStatus } from "./types";

export const TASK_DND_TYPE = "TASK";

export type TaskDragItem = {
  id: number;
  status: TaskStatus;
};
