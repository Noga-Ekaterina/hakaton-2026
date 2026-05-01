import { Navigate, useParams } from "react-router-dom";
import {
  useGetCreateTaskMetaQuery,
  useGetTaskQuery,
  useGetTaskTimelineQuery,
} from "@/app/store/api/tasks-api";
import { paths } from "@/shared/config/routes";
import { TaskDetails } from "@/widgets/task-details";

export function TaskPage() {
  const { projectId, taskId } = useParams();
  const projectIdNumber = Number(projectId);
  const taskIdNumber = Number(taskId);
  const hasValidParams = Number.isInteger(projectIdNumber) && Number.isInteger(taskIdNumber);
  const { data: task, isLoading, isError, error } = useGetTaskQuery(taskIdNumber, { skip: !hasValidParams });
  const { data: timeline = [], isLoading: isTimelineLoading } = useGetTaskTimelineQuery(taskIdNumber, { skip: !hasValidParams });
  const { data: meta } = useGetCreateTaskMetaQuery(projectIdNumber, { skip: !hasValidParams });

  if (!hasValidParams) {
    return <Navigate to={paths.home} replace />;
  }

  return (
    <section className="space-y-6">
      {isLoading ? (
        <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 text-slate-600 shadow-sm backdrop-blur-sm">
          Загружаем задачу...
        </section>
      ) : null}

      {isError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить задачу.
          {error && "data" in error ? <div className="mt-2 text-sm text-rose-700">{String(error.data)}</div> : null}
        </section>
      ) : null}

      {task ? (
        <TaskDetails
          isTimelineLoading={isTimelineLoading}
          meta={meta}
          projectId={projectIdNumber}
          task={task}
          timeline={timeline}
        />
      ) : null}
    </section>
  );
}
