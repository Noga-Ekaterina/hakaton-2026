import { Button } from "@/shared/ui/button";
import { useCreateTaskCommentForm } from "../model/use-create-task-comment-form";

type CreateTaskCommentFormProps = {
  taskId: number;
};

export function CreateTaskCommentForm({ taskId }: CreateTaskCommentFormProps) {
  const { commentBody, commentError, handleCreateComment, isCreatingComment, setCommentBody } = useCreateTaskCommentForm(taskId);

  return (
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
  );
}
