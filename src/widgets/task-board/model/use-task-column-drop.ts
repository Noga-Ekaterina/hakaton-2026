import { useDrop } from "react-dnd";
import { TASK_DND_TYPE } from "@/entities/task/model/dnd";
import type { TaskStatus } from "@/entities/task";
import type { TaskDragItem } from "@/entities/task/model/dnd";

type UseTaskColumnDropParams = {
  targetStatus: TaskStatus;
  onMoveTask: (taskId: number, status: TaskStatus) => void;
};

export function useTaskColumnDrop({ targetStatus, onMoveTask }: UseTaskColumnDropParams) {
  return useDrop(
    () => ({
      accept: TASK_DND_TYPE,
      canDrop: (item: TaskDragItem) => item.status !== targetStatus,
      drop: (item: TaskDragItem) => {
        if (item.status !== targetStatus) {
          onMoveTask(item.id, targetStatus);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onMoveTask, targetStatus],
  );
}
