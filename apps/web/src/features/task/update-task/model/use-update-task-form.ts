import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { useUpdateTaskMutation } from "@/app/store/api/tasks-api";
import {
  buildUpdateTaskInput,
  getEditableTaskValues,
  parseTaskStoryPoints,
  type EditableTaskValues,
  type Task,
} from "@/entities/task";

export type NewTaskPhotoPreview = {
  id: string;
  name: string;
  url: string;
  index: number;
};

export function useUpdateTaskForm(task?: Task) {
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<EditableTaskValues | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      return;
    }

    setValues(getEditableTaskValues(task));
  }, [task]);

  const newPhotoPreviews = useMemo(
    () =>
      values?.photos.map((photo, index) => ({
        id: `${photo.name}-${photo.lastModified}-${index}`,
        name: photo.name,
        url: URL.createObjectURL(photo),
        index,
      })) ?? [],
    [values?.photos],
  );

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [newPhotoPreviews]);

  const startEdit = () => {
    if (task) {
      setValues(getEditableTaskValues(task));
      setSubmitError(null);
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    if (task) {
      setValues(getEditableTaskValues(task));
    }

    setSubmitError(null);
    setIsEditing(false);
  };

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPhotos = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (nextPhotos.length === 0) {
      return;
    }

    setValues((current) => (current ? { ...current, photos: [...current.photos, ...nextPhotos] } : current));
  };

  const removeExistingPhoto = (imageId: number) => {
    setValues((current) =>
      current ? { ...current, keepImageIds: current.keepImageIds.filter((currentId) => currentId !== imageId) } : current,
    );
  };

  const removeNewPhoto = (index: number) => {
    setValues((current) => (current ? { ...current, photos: current.photos.filter((_, currentIndex) => currentIndex !== index) } : current));
  };

  const save = async () => {
    if (!values || !task) {
      return;
    }

    const storyPoints = parseTaskStoryPoints(values.storyPoints);

    if (values.title.trim().length < 3) {
      setSubmitError("Название должно быть не короче 3 символов.");
      return;
    }

    if (storyPoints !== null && (!Number.isInteger(storyPoints) || storyPoints <= 0)) {
      setSubmitError("Story points должны быть положительным целым числом.");
      return;
    }

    try {
      await updateTask({ id: task.id, projectId: task.projectId, body: buildUpdateTaskInput(values) }).unwrap();
      setIsEditing(false);
      setSubmitError(null);
    } catch {
      setSubmitError("Не удалось сохранить задачу. Попробуйте еще раз.");
    }
  };

  return {
    addPhotos,
    cancelEdit,
    isEditing,
    isUpdating,
    newPhotoPreviews,
    removeExistingPhoto,
    removeNewPhoto,
    save,
    setValues,
    startEdit,
    submitError,
    values,
  };
}
