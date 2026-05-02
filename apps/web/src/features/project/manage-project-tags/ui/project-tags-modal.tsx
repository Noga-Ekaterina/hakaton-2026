import type { Project } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import { useProjectTagsModal } from "../model/use-project-tags-modal";

type ProjectTagsModalProps = {
  open: boolean;
  project: Project;
  onClose: () => void;
};

export function ProjectTagsModal({ onClose, open, project }: ProjectTagsModalProps) {
  const {
    changedTagIds,
    createTag,
    deleteTag,
    drafts,
    error,
    isError,
    isLoading,
    isPending,
    newTag,
    saveTag,
    setNewTag,
    tags,
    updateDraft,
  } = useProjectTagsModal(project.id, open);
  const changedIds = new Set(changedTagIds);

  return (
    <Modal
      open={open}
      title="Теги проекта"
      description={project.name}
      onClose={onClose}
      actions={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {isLoading ? <p className="text-sm text-slate-600">Загружаем теги...</p> : null}
        {isError ? <p className="text-sm text-rose-600">Не удалось загрузить теги.</p> : null}
        {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

        <section className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_7rem_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="new-tag-name">Название</Label>
            <Input
              id="new-tag-name"
              value={newTag.name}
              maxLength={40}
              onChange={(event) => setNewTag({ ...newTag, name: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-tag-color">Цвет</Label>
            <input
              id="new-tag-color"
              className="h-11 w-full rounded-2xl border border-border bg-white px-2 shadow-sm"
              type="color"
              value={newTag.color}
              onChange={(event) => setNewTag({ ...newTag, color: event.target.value })}
            />
          </div>
          <Button type="button" onClick={createTag} disabled={isPending}>
            Добавить
          </Button>
        </section>

        <div className="space-y-3">
          {tags.length === 0 && !isLoading ? <p className="text-sm text-slate-500">В проекте пока нет тегов.</p> : null}
          {tags.map((tag) => {
            const draft = drafts[tag.id] ?? { name: tag.name, color: tag.color };
            const hasChanges = changedIds.has(tag.id);

            return (
              <div
                key={tag.id}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_7rem_auto_auto] md:items-end"
              >
                <div className="space-y-2">
                  <Label htmlFor={`tag-name-${tag.id}`}>Название</Label>
                  <Input
                    id={`tag-name-${tag.id}`}
                    value={draft.name}
                    maxLength={40}
                    onChange={(event) => updateDraft(tag.id, { ...draft, name: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`tag-color-${tag.id}`}>Цвет</Label>
                  <input
                    id={`tag-color-${tag.id}`}
                    className="h-11 w-full rounded-2xl border border-border bg-white px-2 shadow-sm"
                    type="color"
                    value={draft.color}
                    onChange={(event) => updateDraft(tag.id, { ...draft, color: event.target.value })}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={() => saveTag(tag.id)} disabled={isPending || !hasChanges}>
                  Сохранить
                </Button>
                <Button type="button" variant="ghost" onClick={() => deleteTag(tag.id)} disabled={isPending}>
                  Удалить
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
