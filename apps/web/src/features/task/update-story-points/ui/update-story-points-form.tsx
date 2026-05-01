import type { Task } from "@/entities/task";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useUpdateStoryPointsForm } from "../model/use-update-story-points-form";

type UpdateStoryPointsFormProps = {
  task: Task;
};

export function UpdateStoryPointsForm({ task }: UpdateStoryPointsFormProps) {
  const { handleSaveStoryPoints, isUpdating, setStoryPointsValue, storyPointsError, storyPointsValue } =
    useUpdateStoryPointsForm(task);

  return (
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
  );
}
