import { useUpdateTaskStatusMutation } from "@/app/store/api/tasks-api";
import type { TaskListItem } from "@/entities/task";

export function useTaskActions(task: Pick<TaskListItem, "id" | "projectId" | "status">) {
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
