import { useState } from "react";
import type { TaskListItem } from "@/entities/task";

export function useDeleteTaskModal() {
  const [task, setTask] = useState<TaskListItem | null>(null);

  return {
    task,
    isOpen: Boolean(task),
    open: setTask,
    close: () => setTask(null),
  };
}
