import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Cross2Icon, Pencil1Icon } from "@radix-ui/react-icons";
import {
  useGetCreateTaskMetaQuery,
  useGetTaskQuery,
  useGetTaskTimelineQuery,
  useCreateTaskCommentMutation,
  useUpdateTaskMutation,
  type UpdateTaskInput,
} from "@/app/store/api/tasks-api";
import type { Task, TaskChange, TaskEvent, TaskEventType, TaskPriority, TaskStatus, TaskTimelineItem } from "@/entities/task";
import { API_BASE_URL } from "@/shared/config/api";
import { paths, projectPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const statusLabels: Record<TaskStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  AWAITING_INSPECTION: "На проверке",
  DONE: "Готово",
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
  CRITICAL: "Критический",
};

const statusMeta: Record<TaskStatus, { label: string; className: string }> = {
  NEW: {
    label: statusLabels.NEW,
    className: "bg-sky-100 text-sky-900",
  },
  IN_PROGRESS: {
    label: statusLabels.IN_PROGRESS,
    className: "bg-amber-100 text-amber-900",
  },
  AWAITING_INSPECTION: {
    label: statusLabels.AWAITING_INSPECTION,
    className: "bg-indigo-100 text-indigo-900",
  },
  DONE: {
    label: statusLabels.DONE,
    className: "bg-emerald-100 text-emerald-900",
  },
};

const priorityMeta: Record<TaskPriority, { label: string; className: string }> = {
  LOW: {
    label: priorityLabels.LOW,
    className: "bg-slate-100 text-slate-700",
  },
  MEDIUM: {
    label: priorityLabels.MEDIUM,
    className: "bg-cyan-100 text-cyan-900",
  },
  HIGH: {
    label: priorityLabels.HIGH,
    className: "bg-orange-100 text-orange-900",
  },
  CRITICAL: {
    label: priorityLabels.CRITICAL,
    className: "bg-red-100 text-red-900",
  },
};

type EditableTaskValues = {
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: number;
  storyPoints: string;
  keepImageIds: number[];
  photos: File[];
};

function getImageSrc(imageUrl: string) {
  return imageUrl.startsWith("http") ? imageUrl : `${API_BASE_URL}${imageUrl}`;
}

function getEditableValues(task: Task): EditableTaskValues {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assigneeId: task.assigneeId,
    storyPoints: task.storyPoints === null ? "" : String(task.storyPoints),
    keepImageIds: task.images.map((image) => image.id),
    photos: [],
  };
}

function parseStoryPoints(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function buildUpdateTaskInput(values: EditableTaskValues): UpdateTaskInput {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    status: values.status,
    assigneeId: values.assigneeId,
    storyPoints: parseStoryPoints(values.storyPoints),
    keepImageIds: values.keepImageIds,
    photos: values.photos,
  };
}

function formatTimelineDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFieldLabel(field: string) {
  const labels: Record<string, string> = {
    title: "Название",
    description: "Описание",
    priority: "Приоритет",
    status: "Статус",
    assigneeId: "Исполнитель",
    storyPoints: "Story points",
    images: "Фото",
  };

  return labels[field] ?? field;
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && value in statusMeta;
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && value in priorityMeta;
}

function ChangeValueBadge({ className, children }: { className: string; children: ReactNode }) {
  return <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

function formatChangeValue(field: string, value: unknown, userNameById: Map<number, string>) {
  if (value === null || typeof value === "undefined" || value === "") {
    return "не указано";
  }

  if (field === "status" && isTaskStatus(value)) {
    return <ChangeValueBadge className={statusMeta[value].className}>{statusMeta[value].label}</ChangeValueBadge>;
  }

  if (field === "priority" && isTaskPriority(value)) {
    return <ChangeValueBadge className={priorityMeta[value].className}>{priorityMeta[value].label}</ChangeValueBadge>;
  }

  if (field === "assigneeId" && typeof value === "number") {
    return userNameById.get(value) ?? `#${value}`;
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} файл(ов)` : "нет файлов";
  }

  return String(value);
}

function renderChange(change: TaskChange, userNameById: Map<number, string>) {
  const isStatusChange = change.field === "status";

  return (
    <span className={`inline-flex items-center gap-2 ${isStatusChange ? "max-w-full overflow-x-auto whitespace-nowrap" : "flex-wrap"}`}>
      <span className={isStatusChange ? "shrink-0" : undefined}>{getFieldLabel(change.field)}:</span>
      {formatChangeValue(change.field, change.oldValue, userNameById)}
      <span className={isStatusChange ? "shrink-0" : undefined} aria-hidden="true">
        →
      </span>
      {formatChangeValue(change.field, change.newValue, userNameById)}
    </span>
  );
}

function getEventAction(type: TaskEventType) {
  const labels: Record<TaskEventType, string> = {
    TASK_CREATED: "создал(а) задачу",
    TASK_UPDATED: "изменил(а) задачу",
    STATUS_UPDATED: "изменил(а) статус",
    STORY_POINTS_UPDATED: "изменил(а) story points",
  };

  return labels[type];
}

function renderEventTitle(item: TaskEvent, userNameById: Map<number, string>) {
  const actorName = item.actor?.name ?? "Система";
  const statusChange = item.type === "STATUS_UPDATED" ? item.changes.find((change) => change.field === "status") : undefined;

  if (statusChange) {
    return (
      <span className="inline-flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap">
        <span className="shrink-0">
          {actorName} {getEventAction(item.type)}:
        </span>
        {formatChangeValue(statusChange.field, statusChange.oldValue, userNameById)}
        <span className="shrink-0" aria-hidden="true">
          →
        </span>
        {formatChangeValue(statusChange.field, statusChange.newValue, userNameById)}
      </span>
    );
  }

  return (
    <>
      {actorName} {getEventAction(item.type)}
    </>
  );
}

export function TaskPage() {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  const projectIdNumber = Number(projectId);
  const taskIdNumber = Number(taskId);
  const hasValidParams = Number.isInteger(projectIdNumber) && Number.isInteger(taskIdNumber);
  const { data: task, isLoading, isError, error } = useGetTaskQuery(taskIdNumber, { skip: !hasValidParams });
  const { data: timeline = [], isLoading: isTimelineLoading } = useGetTaskTimelineQuery(taskIdNumber, { skip: !hasValidParams });
  const { data: meta } = useGetCreateTaskMetaQuery(projectIdNumber, { skip: !hasValidParams });
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [createTaskComment, { isLoading: isCreatingComment }] = useCreateTaskCommentMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState<EditableTaskValues | null>(null);
  const [storyPointsValue, setStoryPointsValue] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [storyPointsError, setStoryPointsError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    if (!task) {
      return;
    }

    setValues(getEditableValues(task));
    setStoryPointsValue(task.storyPoints === null ? "" : String(task.storyPoints));
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

  const userNameById = useMemo(() => {
    const names = new Map<number, string>();

    if (task) {
      names.set(task.authorId, task.authorName);
      names.set(task.assigneeId, task.assigneeName);
    }

    meta?.users.forEach((user) => {
      names.set(user.id, user.name);
    });

    return names;
  }, [meta?.users, task]);

  useEffect(() => {
    return () => {
      newPhotoPreviews.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [newPhotoPreviews]);

  if (!hasValidParams) {
    return <Navigate to={paths.home} replace />;
  }

  const taskImages = task?.images.map((image) => ({
    ...image,
    src: getImageSrc(image.url),
  })) ?? [];
  const visibleImages = isEditing && values ? taskImages.filter((image) => values.keepImageIds.includes(image.id)) : taskImages;
  const hasSingleImage = visibleImages.length + newPhotoPreviews.length === 1;

  const handleStartEdit = () => {
    if (task) {
      setValues(getEditableValues(task));
      setSubmitError(null);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    if (task) {
      setValues(getEditableValues(task));
    }
    setSubmitError(null);
    setIsEditing(false);
  };

  const handleAddPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPhotos = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (nextPhotos.length === 0) {
      return;
    }

    setValues((current) => (current ? { ...current, photos: [...current.photos, ...nextPhotos] } : current));
  };

  const handleRemoveExistingPhoto = (imageId: number) => {
    setValues((current) =>
      current ? { ...current, keepImageIds: current.keepImageIds.filter((currentId) => currentId !== imageId) } : current,
    );
  };

  const handleRemoveNewPhoto = (index: number) => {
    setValues((current) => (current ? { ...current, photos: current.photos.filter((_, currentIndex) => currentIndex !== index) } : current));
  };

  const handleSave = async () => {
    if (!values || !task) {
      return;
    }

    const storyPoints = parseStoryPoints(values.storyPoints);

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

  const handleSaveStoryPoints = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!task) {
      return;
    }

    const storyPoints = parseStoryPoints(storyPointsValue);

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
          keepImageIds: task.images.map((image) => image.id),
          photos: [],
        },
      }).unwrap();
      setStoryPointsError(null);
    } catch {
      setStoryPointsError("Не удалось сохранить story points.");
    }
  };

  const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!task) {
      return;
    }

    const body = commentBody.trim();

    if (!body) {
      setCommentError("Введите комментарий.");
      return;
    }

    try {
      await createTaskComment({ taskId: task.id, body }).unwrap();
      setCommentBody("");
      setCommentError(null);
    } catch {
      setCommentError("Не удалось добавить комментарий.");
    }
  };

  return (
    <section className="space-y-6">
      <Button type="button" variant="ghost" className="gap-2 px-0 hover:bg-transparent" onClick={() => navigate(projectPath(projectIdNumber))}>
        <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
        К доске проекта
      </Button>

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

      {task && values ? (
        <section className="space-y-6">
          <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Задача #{task.id}</p>
                {isEditing ? (
                  <div className="mt-3 max-w-3xl">
                    <Label htmlFor="task-edit-title">Название</Label>
                    <Input
                      id="task-edit-title"
                      className="mt-2"
                      value={values.title}
                      onChange={(event) => setValues({ ...values, title: event.target.value })}
                    />
                  </div>
                ) : (
                  <h2 className="mt-3 break-words text-3xl font-black tracking-tight text-slate-950">{task.title}</h2>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  <>
                    <Button type="button" variant="secondary" onClick={handleCancelEdit} disabled={isUpdating}>
                      Отмена
                    </Button>
                    <Button type="button" onClick={handleSave} disabled={isUpdating}>
                      {isUpdating ? "Сохраняем..." : "Сохранить"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" className="gap-2" onClick={handleStartEdit}>
                    <Pencil1Icon className="h-4 w-4" aria-hidden="true" />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>
            {submitError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <h3 className="text-xl font-black tracking-tight text-slate-950">Описание</h3>
                {isEditing ? (
                  <textarea
                    className="mt-4 min-h-44 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                    value={values.description}
                    onChange={(event) => setValues({ ...values, description: event.target.value })}
                  />
                ) : task.description ? (
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{task.description}</p>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">Описание пока не добавлено.</p>
                )}
              </section>

              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-black tracking-tight text-slate-950">Фото</h3>
                  {isEditing ? (
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90">
                      Добавить фото
                      <input className="sr-only" type="file" accept="image/*" multiple onChange={handleAddPhotos} />
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
                            onClick={() => handleRemoveExistingPhoto(image.id)}
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
                          onClick={() => handleRemoveNewPhoto(photo.index)}
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

              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
                <h3 className="text-xl font-black tracking-tight text-slate-950">Обсуждение и история</h3>

                <form className="mt-5 space-y-3" onSubmit={handleCreateComment}>
                  <textarea
                    className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Оставить комментарий..."
                    value={commentBody}
                    onChange={(event) => setCommentBody(event.target.value)}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {commentError ? <p className="text-sm text-rose-600">{commentError}</p> : <span />}
                    <Button type="submit" disabled={isCreatingComment}>
                      {isCreatingComment ? "Отправляем..." : "Комментировать"}
                    </Button>
                  </div>
                </form>

                <div className="mt-6 space-y-4">
                  {isTimelineLoading ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Загружаем историю...</p> : null}

                  {!isTimelineLoading && timeline.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                      Пока нет комментариев и изменений.
                    </p>
                  ) : null}

                  {timeline.map((item: TaskTimelineItem) => (
                    <article key={`${item.kind}-${item.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {item.kind === "comment" ? (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-950">{item.author.name}</p>
                            <time className="text-xs font-semibold text-slate-500">{formatTimelineDate(item.createdAt)}</time>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                            {item.isDeleted ? "Комментарий удален." : item.body}
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-950">
                              {renderEventTitle(item, userNameById)}
                            </p>
                            <time className="text-xs font-semibold text-slate-500">{formatTimelineDate(item.createdAt)}</time>
                          </div>
                          {item.type === "TASK_UPDATED" && item.changes.length > 0 ? (
                            <details className="mt-3 text-sm leading-6 text-slate-700">
                              <summary className="cursor-pointer font-semibold text-slate-600">Показать изменения</summary>
                              <ul className="mt-2 space-y-2">
                                {item.changes.map((change, index) => (
                                  <li key={`${change.field}-${index}`}>{renderChange(change, userNameById)}</li>
                                ))}
                              </ul>
                            </details>
                          ) : null}
                          {item.type !== "TASK_UPDATED" && item.type !== "STATUS_UPDATED" && item.changes.length > 0 ? (
                            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                              {item.changes.map((change, index) => (
                                <li key={`${change.field}-${index}`}>{renderChange(change, userNameById)}</li>
                              ))}
                            </ul>
                          ) : null}
                        </>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                <h3 className="text-lg font-black tracking-tight text-slate-950">Детали</h3>
                <dl className="mt-5 space-y-4">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Статус</dt>
                    <dd className="mt-2">
                      {isEditing ? (
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={values.status}
                          onChange={(event) => setValues({ ...values, status: event.target.value as TaskStatus })}
                        >
                          {meta?.taskStatuses.map((status) => (
                            <option key={status} value={status}>
                              {statusLabels[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusMeta[task.status].className}`}>
                          {statusMeta[task.status].label}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Приоритет</dt>
                    <dd className="mt-2">
                      {isEditing ? (
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={values.priority}
                          onChange={(event) => setValues({ ...values, priority: event.target.value as TaskPriority })}
                        >
                          {meta?.taskPriorities.map((priority) => (
                            <option key={priority} value={priority}>
                              {priorityLabels[priority]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityMeta[task.priority].className}`}>
                          {priorityMeta[task.priority].label}
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Исполнитель</dt>
                    <dd className="mt-2">
                      {isEditing ? (
                        <select
                          className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          value={values.assigneeId}
                          onChange={(event) => setValues({ ...values, assigneeId: Number(event.target.value) })}
                        >
                          {meta?.users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">{task.assigneeName}</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Автор</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{task.authorName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Создана</dt>
                    <dd className="mt-2 text-sm font-semibold text-slate-900">{new Date(task.createdAt).toLocaleDateString("ru-RU")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Story points</dt>
                    <dd className="mt-2">
                      {isEditing ? (
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={values.storyPoints}
                          onChange={(event) => setValues({ ...values, storyPoints: event.target.value })}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-900">{task.storyPoints ?? "Не указаны"}</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {!isEditing ? (
                <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
                  <h3 className="text-lg font-black tracking-tight text-slate-950">Story points</h3>
                  <form className="mt-4 space-y-3" onSubmit={handleSaveStoryPoints}>
                    <Input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Не указаны"
                      value={storyPointsValue}
                      onChange={(event) => setStoryPointsValue(event.target.value)}
                    />
                    {storyPointsError ? <p className="text-sm text-rose-600">{storyPointsError}</p> : null}
                    <Button type="submit" className="w-full" disabled={isUpdating}>
                      {isUpdating ? "Сохраняем..." : "Сохранить story points"}
                    </Button>
                  </form>
                </section>
              ) : null}

              <Button asChild variant="secondary" className="w-full">
                <Link to={projectPath(projectIdNumber)}>Вернуться на доску</Link>
              </Button>
            </aside>
          </section>
        </section>
      ) : null}
    </section>
  );
}
