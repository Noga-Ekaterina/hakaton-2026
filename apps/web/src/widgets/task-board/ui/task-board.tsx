import { useMemo } from "react";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/app/store/api/tasks-api";
import type { TaskStatus } from "@/entities/task";
import { DeleteTaskModal, useDeleteTaskModal } from "@/features/task/delete-task";
import { getTaskFilters } from "@/widgets/task-filters";
import { columnConfig } from "../model/column-config";
import { getColumnTasks } from "../model/get-column-tasks";
import { TaskColumn } from "./task-column";
import { useSearchParams } from "react-router-dom";

type TaskBoardProps = {
  projectId: number;
};

export function TaskBoard({ projectId }: TaskBoardProps) {
  const { data: tasks, isLoading, isError, error } = useGetTasksQuery(projectId);
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [searchParams] = useSearchParams();
  const filters = useMemo(() => getTaskFilters(searchParams), [searchParams]);
  const deleteTaskModal = useDeleteTaskModal();

  const handleMoveTask = (taskId: number, status: TaskStatus) => {
    updateTaskStatus({ id: taskId, status, projectId });
  };

  return (
    <section>
      {isLoading ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
          Загружаем задачи...
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить задачи.
          {error && "data" in error ? <div className="mt-2 text-sm text-rose-700">{String(error.data)}</div> : null}
        </section>
      ) : null}

      {tasks ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {columnConfig.map((column) => (
            <TaskColumn
              key={column.title}
              title={column.title}
              description={column.description}
              statuses={column.statuses}
              accent={column.accent}
              tasks={getColumnTasks(tasks, column.statuses, filters)}
              onMoveTask={handleMoveTask}
              onDeleteTask={deleteTaskModal.open}
            />
          ))}
        </section>
      ) : null}
      <DeleteTaskModal open={deleteTaskModal.isOpen} task={deleteTaskModal.task} onClose={deleteTaskModal.close} />
    </section>
  );
}
