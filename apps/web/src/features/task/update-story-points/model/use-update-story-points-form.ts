import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useUpdateTaskStoryPointsMutation } from "@/app/store/api/tasks-api";
import { parseTaskStoryPoints, type Task } from "@/entities/task";

type UpdateStoryPointsTask = Pick<Task, "id" | "projectId" | "storyPoints">;

export function useUpdateStoryPointsForm(task: UpdateStoryPointsTask) {
  const [updateTaskStoryPoints, { isLoading: isUpdating }] = useUpdateTaskStoryPointsMutation();
  const [storyPointsValue, setStoryPointsValue] = useState("");
  const [storyPointsError, setStoryPointsError] = useState<string | null>(null);
  const initialStoryPointsValue = task.storyPoints === null ? "" : String(task.storyPoints);
  const isStoryPointsUnchanged = storyPointsValue === initialStoryPointsValue;

  useEffect(() => {
    setStoryPointsValue(initialStoryPointsValue);
  }, [initialStoryPointsValue]);

  const handleSaveStoryPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isStoryPointsUnchanged) {
      return;
    }

    const storyPoints = parseTaskStoryPoints(storyPointsValue);

    if (storyPoints !== null && (!Number.isInteger(storyPoints) || storyPoints <= 0)) {
      setStoryPointsError("Введите положительное целое число или оставьте поле пустым.");
      return;
    }

    try {
      await updateTaskStoryPoints({
        id: task.id,
        projectId: task.projectId,
        storyPoints,
      }).unwrap();
      setStoryPointsError(null);
    } catch {
      setStoryPointsError("Не удалось сохранить story points.");
    }
  };

  return {
    handleSaveStoryPoints,
    isStoryPointsUnchanged,
    isUpdating,
    setStoryPointsValue,
    storyPointsError,
    storyPointsValue,
  };
}
