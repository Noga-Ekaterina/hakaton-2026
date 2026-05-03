import type { Task, TaskListItem } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useUpdateStoryPointsForm } from "../model/use-update-story-points-form";

type UpdateStoryPointsFormProps = {
  task: Pick<Task | TaskListItem, "id" | "projectId" | "storyPoints">;
};

export function UpdateStoryPointsForm({ task }: UpdateStoryPointsFormProps) {
  const {
    handleSaveStoryPoints,
    isStoryPointsUnchanged,
    isUpdating,
    setStoryPointsValue,
    storyPointsError,
    storyPointsValue,
  } = useUpdateStoryPointsForm(task);

  return (
    <form className="mt-4 space-y-3" onSubmit={handleSaveStoryPoints}>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={1}
          step={1}
          placeholder="Не указаны"
          value={storyPointsValue}
          onChange={(event) => setStoryPointsValue(event.target.value)}
          className="min-w-0 flex-1"
        />
        <Button type="submit" className="shrink-0" disabled={isUpdating || isStoryPointsUnchanged}>
          {isUpdating ? "Сохраняем..." : "Сохранить"}
        </Button>
      </div>
      {storyPointsError ? <p className="text-sm text-rose-600">{storyPointsError}</p> : null}
    </form>
  );
}
