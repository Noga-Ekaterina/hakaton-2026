import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { CreateTaskMeta } from "@/app/store/api/tasks-api";
import type { Task, TaskTimelineItem } from "@/entities/task";
import { DeleteTaskModal, useDeleteTaskModal } from "@/features/task/delete-task";
import { TaskActions } from "@/features/task/task-actions";
import { useUpdateTaskForm } from "@/features/task/update-task";
import { projectPath } from "@/shared/config/routes";
import { TaskDescription } from "./task-description";
import { TaskHeader } from "./task-header";
import { TaskPhotos } from "./task-photos";
import { TaskSidebar } from "./task-sidebar";
import { TaskTimeline } from "./task-timeline";

type TaskDetailsProps = {
  isTimelineLoading: boolean;
  meta?: CreateTaskMeta;
  projectId: number;
  task: Task;
  timeline: TaskTimelineItem[];
};

export function TaskDetails({ isTimelineLoading, meta, projectId, task, timeline }: TaskDetailsProps) {
  const navigate = useNavigate();
  const updateForm = useUpdateTaskForm(task);
  const deleteTaskModal = useDeleteTaskModal();

  const userNameById = useMemo(() => {
    const names = new Map<number, string>();

    names.set(task.authorId, task.authorName);
    names.set(task.assigneeId, task.assigneeName);
    meta?.users.forEach((user) => {
      names.set(user.id, user.name);
    });

    return names;
  }, [meta?.users, task]);

  if (!updateForm.values) {
    return null;
  }

  return (
    <section className="space-y-6">
      <TaskHeader
        actions={<TaskActions mode="full" task={task} onDeleteClick={deleteTaskModal.open} />}
        isEditing={updateForm.isEditing}
        isUpdating={updateForm.isUpdating}
        submitError={updateForm.submitError}
        task={task}
        values={updateForm.values}
        onBack={() => navigate(projectPath(projectId))}
        onCancelEdit={updateForm.cancelEdit}
        onSave={updateForm.save}
        onStartEdit={updateForm.startEdit}
        onValuesChange={updateForm.setValues}
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <TaskPhotos
            isEditing={updateForm.isEditing}
            newPhotoPreviews={updateForm.newPhotoPreviews}
            task={task}
            values={updateForm.values}
            onAddPhotos={updateForm.addPhotos}
            onRemoveExistingPhoto={updateForm.removeExistingPhoto}
            onRemoveNewPhoto={updateForm.removeNewPhoto}
          />
          <TaskDescription
            isEditing={updateForm.isEditing}
            task={task}
            values={updateForm.values}
            onValuesChange={updateForm.setValues}
          />
          <TaskTimeline isLoading={isTimelineLoading} taskId={task.id} timeline={timeline} userNameById={userNameById} />
        </div>

        <TaskSidebar
          isEditing={updateForm.isEditing}
          meta={meta}
          projectId={projectId}
          task={task}
          values={updateForm.values}
          onValuesChange={updateForm.setValues}
        />
      </section>
      <DeleteTaskModal
        open={deleteTaskModal.isOpen}
        task={deleteTaskModal.task}
        onClose={deleteTaskModal.close}
        event={() => navigate(projectPath(projectId))}
      />
    </section>
  );
}
