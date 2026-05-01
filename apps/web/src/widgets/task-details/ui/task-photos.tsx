import type { ChangeEvent } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { getTaskImageSrc, type EditableTaskValues, type Task } from "@/entities/task";
import type { NewTaskPhotoPreview } from "@/features/task/update-task";
import { Button } from "@/shared/ui/button";

type TaskPhotosProps = {
  isEditing: boolean;
  newPhotoPreviews: NewTaskPhotoPreview[];
  task: Task;
  values: EditableTaskValues;
  onAddPhotos: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveExistingPhoto: (imageId: number) => void;
  onRemoveNewPhoto: (index: number) => void;
};

export function TaskPhotos({
  isEditing,
  newPhotoPreviews,
  onAddPhotos,
  onRemoveExistingPhoto,
  onRemoveNewPhoto,
  task,
  values,
}: TaskPhotosProps) {
  const taskImages = task.images.map((image) => ({
    ...image,
    src: getTaskImageSrc(image.url),
  }));
  const visibleImages = isEditing ? taskImages.filter((image) => values.keepImageIds.includes(image.id)) : taskImages;
  const hasSingleImage = visibleImages.length + newPhotoPreviews.length === 1;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black tracking-tight text-slate-950">Фото</h3>
        {isEditing ? (
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
            Добавить фото
            <input className="sr-only" type="file" accept="image/*" multiple onChange={onAddPhotos} />
          </label>
        ) : null}
      </div>

      {visibleImages.length > 0 || newPhotoPreviews.length > 0 ? (
        <div className={`mt-5 grid gap-4 ${hasSingleImage ? "grid-cols-1" : "lg:grid-cols-2"}`}>
          {visibleImages.map((image) => (
            <figure key={image.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <a href={image.src} target="_blank" rel="noreferrer">
                <img src={image.src} alt={image.name} className="aspect-[16/10] w-full object-cover" loading="lazy" />
              </a>
              {isEditing ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="absolute right-3 top-3 h-10 w-10 px-0 py-0 text-rose-600 shadow-lg"
                  aria-label="Удалить фото"
                  onClick={() => onRemoveExistingPhoto(image.id)}
                >
                  <Cross2Icon className="h-5 w-5" aria-hidden="true" />
                </Button>
              ) : null}
            </figure>
          ))}
          {newPhotoPreviews.map((photo) => (
            <figure key={photo.id} className="relative overflow-hidden rounded-2xl border border-primary/30 bg-orange-50">
              <img src={photo.url} alt={photo.name} className="aspect-[16/10] w-full object-cover" />
              <Button
                type="button"
                variant="secondary"
                className="absolute right-3 top-3 h-10 w-10 px-0 py-0 text-rose-600 shadow-lg"
                aria-label="Убрать новое фото"
                onClick={() => onRemoveNewPhoto(photo.index)}
              >
                <Cross2Icon className="h-5 w-5" aria-hidden="true" />
              </Button>
            </figure>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
          Фото пока не добавлены.
        </div>
      )}
    </section>
  );
}
