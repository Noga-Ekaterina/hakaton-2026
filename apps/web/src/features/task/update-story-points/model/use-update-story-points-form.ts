import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useUpdateTaskMutation } from "@/app/store/api/tasks-api";
import { parseTaskStoryPoints, type Task } from "@/entities/task";

export function useUpdateStoryPointsForm(task: Task) {
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [storyPointsValue, setStoryPointsValue] = useState("");
  const [storyPointsError, setStoryPointsError] = useState<string | null>(null);

  useEffect(() => {
    setStoryPointsValue(task.storyPoints === null ? "" : String(task.storyPoints));
  }, [task.storyPoints]);

  const handleSaveStoryPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const storyPoints = parseTaskStoryPoints(storyPointsValue);

    if (storyPoints !== null && (!Number.isInteger(storyPoints) || storyPoints <= 0)) {
      setStoryPointsError("Введите положительное целое число или оставьте поле пустым.");
      return;
    }

    try {
      await updateTask({
        id: task.id,
        projectId: task.projectId,
        body: {
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          assigneeId: task.assigneeId,
          storyPoints,
          tagIds: task.tags.map((tag) => tag.id),
          keepImageIds: task.images.map((image) => image.id),
          photos: [],
        },
      }).unwrap();
      setStoryPointsError(null);
    } catch {
      setStoryPointsError("Не удалось сохранить story points.");
    }
  };

  return {
    handleSaveStoryPoints,
    isUpdating,
    setStoryPointsValue,
    storyPointsError,
    storyPointsValue,
  };
}
