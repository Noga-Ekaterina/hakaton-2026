export type TaskStatus = "NEW" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Task = {
  id: number;
  title: string;
  shortDescription: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string;
  authorName: string;
  assigneeId: number;
  assigneeName: string;
  isOverdue?: boolean;
};
