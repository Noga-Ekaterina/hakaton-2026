import { useState } from "react";
import type { Task } from "@/entities/task";

export function useDeleteTaskModal() {
  const [task, setTask] = useState<Task | null>(null);

  return {
    task,
    isOpen: Boolean(task),
    open: setTask,
    close: () => setTask(null),
  };
}
