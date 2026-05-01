import { useUpdateTaskStatusMutation } from "@/app/store/api/tasks-api";
import type { Task } from "@/entities/task";

export function useTaskActions(task: Task) {
  const [updateTaskStatus, { isLoading: isStatusUpdating }] = useUpdateTaskStatusMutation();
  const nextStatus = task.status === "DONE" ? "NEW" : "DONE";
  const statusButtonLabel = task.status === "DONE" ? "Отметить не сделанной" : "Отметить сделанной";

  const handleStatusButtonClick = () => {
    updateTaskStatus({ id: task.id, status: nextStatus, projectId: task.projectId });
  };

  return {
    handleStatusButtonClick,
    isStatusUpdating,
    statusButtonLabel,
  };
}
