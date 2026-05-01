import { useState } from "react";
import type { FormEvent } from "react";
import { useCreateTaskCommentMutation } from "@/app/store/api/tasks-api";

export function useCreateTaskCommentForm(taskId: number) {
  const [createTaskComment, { isLoading: isCreatingComment }] = useCreateTaskCommentMutation();
  const [commentBody, setCommentBody] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const handleCreateComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const body = commentBody.trim();

    if (!body) {
      setCommentError("Введите комментарий.");
      return;
    }

    try {
      await createTaskComment({ taskId, body }).unwrap();
      setCommentBody("");
      setCommentError(null);
    } catch {
      setCommentError("Не удалось добавить комментарий.");
    }
  };

  return {
    commentBody,
    commentError,
    handleCreateComment,
    isCreatingComment,
    setCommentBody,
  };
}
