import { useParams } from "react-router-dom";
import { TaskBoard } from "@/widgets/task-board";

export function ProjectPage() {
  const { projectId } = useParams();
  const projectIdNumber = Number(projectId);

  return (
    <section className="space-y-6">
      <TaskBoard projectId={projectIdNumber} />
    </section>
  );
}
