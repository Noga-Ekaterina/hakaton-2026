import { UserSelect } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useCreateTaskModal } from "../model/use-create-task-modal";
import { useTaskPhotoPreviews } from "../model/use-task-photo-previews";

type CreateTaskModalProps = {
  open: boolean;
  onClose: () => void;
};

const createTaskFormId = "create-task-form";

export function CreateTaskModal({ open, onClose }: CreateTaskModalProps) {
  const { meta, register, setValue, watch, errors, isLoading, isError, isSubmitting, submitError, submit } = useCreateTaskModal({
    open,
    onClose,
  });
  const photos = watch("photos");
  const { photoPreviews, handlePhotosChange, handleRemovePhoto } = useTaskPhotoPreviews({
    photos,
    onPhotosChange: (nextPhotos) => setValue("photos", nextPhotos, { shouldDirty: true, shouldValidate: true }),
  });

  return (
    <Modal
      open={open}
      title="Создать задачу"
      description="Заполните основные поля, и задача появится на доске после сохранения."
      onClose={onClose}
      actions={
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" form={createTaskFormId} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Сохраняем..." : "Создать задачу"}
          </Button>
        </div>
      }
    >
      <form id={createTaskFormId} className="grid gap-5" onSubmit={submit} noValidate>
        {isLoading ? <p className="text-sm text-slate-600">Загружаем параметры формы...</p> : null}
        {isError ? <p className="text-sm text-rose-600">Не удалось загрузить параметры формы.</p> : null}
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-title">Название</Label>
            <Input
              id="task-title"
              placeholder="Например, подготовить отчет"
              aria-invalid={Boolean(errors.title)}
              {...register("title")}
            />
            {errors.title ? <p className="text-sm text-rose-600">{errors.title.message}</p> : null}
          </div>

          <div className="space-y-3 md:col-span-2">
            <Label htmlFor="task-photos">Фото</Label>
            <input
              id="task-photos"
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotosChange}
            />

            <div className={photoPreviews.length > 0 ? "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" : ""}>
              {photoPreviews.length > 0
                ? photoPreviews.map((photo) => (
                    <div key={photo.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <img src={photo.url} alt={photo.name} className="aspect-[4/3] w-full object-cover" />
                      <button
                        type="button"
                        className="absolute right-2 top-2 rounded-full bg-slate-950/75 px-2 py-1 text-xs font-semibold text-white opacity-90 transition hover:bg-slate-950"
                        onClick={() => handleRemovePhoto(photo.index)}
                      >
                        Удалить
                      </button>
                      <p className="truncate px-3 py-2 text-xs font-medium text-slate-600">{photo.name}</p>
                    </div>
                  ))
                : null}

              <label
                htmlFor="task-photos"
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-primary hover:bg-orange-50/60 ${
                  photoPreviews.length > 0 ? "aspect-[4/3]" : "min-h-32"
                }`}
              >
                <span className="text-sm font-semibold text-slate-900">Добавить фото</span>
                <span className="mt-1 text-xs text-slate-500">Можно выбрать несколько изображений</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-description">Краткое описание</Label>
            <textarea
              id="task-description"
              className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Несколько слов о сути задачи"
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {errors.description ? <p className="text-sm text-rose-600">{errors.description.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-priority">Приоритет</Label>
            <select
              id="task-priority"
              className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-invalid={Boolean(errors.priority)}
              {...register("priority")}
            >
              {meta?.taskPriorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              )) ?? (
                <>
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </>
              )}
            </select>
            {errors.priority ? <p className="text-sm text-rose-600">{errors.priority.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-assignee">Исполнитель</Label>
            <UserSelect
              id="task-assignee"
              users={meta?.users ?? []}
              {...register("assigneeId", {
                setValueAs: (value) => (value === "" ? 0 : Number(value)),
              })}
            />
            {errors.assigneeId ? <p className="text-sm text-rose-600">{errors.assigneeId.message}</p> : null}
          </div>
        </div>
      </form>
    </Modal>
  );
}
