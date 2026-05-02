import { useEffect, useMemo, useState } from "react";
import {
  useCreateProjectTagMutation,
  useDeleteProjectTagMutation,
  useGetProjectTagsQuery,
  useUpdateProjectTagMutation,
} from "@/app/store/api/tasks-api";

const defaultColor = "#64748b";

type DraftTag = {
  name: string;
  color: string;
};

function normalizeDraft(draft: DraftTag) {
  return {
    name: draft.name.trim(),
    color: draft.color,
  };
}

export function useProjectTagsModal(projectId: number, open: boolean) {
  const { data: tags = [], isLoading, isError } = useGetProjectTagsQuery(projectId, { skip: !open });
  const [createProjectTag, { isLoading: isCreating }] = useCreateProjectTagMutation();
  const [updateProjectTag, { isLoading: isUpdating }] = useUpdateProjectTagMutation();
  const [deleteProjectTag, { isLoading: isDeleting }] = useDeleteProjectTagMutation();
  const [drafts, setDrafts] = useState<Record<number, DraftTag>>({});
  const [newTag, setNewTag] = useState<DraftTag>({ name: "", color: defaultColor });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setNewTag({ name: "", color: defaultColor });
      return;
    }

    setDrafts(
      Object.fromEntries(
        tags.map((tag) => [
          tag.id,
          {
            name: tag.name,
            color: tag.color,
          },
        ]),
      ),
    );
  }, [open, tags]);

  const isPending = isCreating || isUpdating || isDeleting;

  const changedTagIds = useMemo(
    () =>
      tags
        .filter((tag) => {
          const draft = drafts[tag.id];
          return draft && (draft.name.trim() !== tag.name || draft.color !== tag.color);
        })
        .map((tag) => tag.id),
    [drafts, tags],
  );

  const updateDraft = (tagId: number, draft: DraftTag) => {
    setDrafts((current) => ({ ...current, [tagId]: draft }));
  };

  const createTag = async () => {
    const body = normalizeDraft(newTag);

    if (!body.name) {
      setError("Введите название тега.");
      return;
    }

    try {
      await createProjectTag({ projectId, ...body }).unwrap();
      setNewTag({ name: "", color: defaultColor });
      setError(null);
    } catch {
      setError("Не удалось создать тег.");
    }
  };

  const saveTag = async (tagId: number) => {
    const draft = drafts[tagId];

    if (!draft) {
      return;
    }

    const body = normalizeDraft(draft);

    if (!body.name) {
      setError("Введите название тега.");
      return;
    }

    try {
      await updateProjectTag({ projectId, tagId, ...body }).unwrap();
      setError(null);
    } catch {
      setError("Не удалось сохранить тег.");
    }
  };

  const deleteTag = async (tagId: number) => {
    try {
      await deleteProjectTag({ projectId, tagId }).unwrap();
      setError(null);
    } catch {
      setError("Не удалось удалить тег.");
    }
  };

  return {
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
  };
}
