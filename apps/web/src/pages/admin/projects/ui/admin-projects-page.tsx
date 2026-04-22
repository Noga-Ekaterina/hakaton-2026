import { useMemo, useState } from "react";
import { useGetProjectsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { ProjectCard } from "@/entities/project";
import { Button } from "@/shared/ui/button";
import { ProjectModal } from "@/features/project/manage-project";

export function AdminProjectsPage() {
  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsFetchError } =
    useGetProjectsQuery();
  const { data: users } = useGetUsersQuery();
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeProject = projects?.find((project) => project.id === activeProjectId) ?? null;
  const memberCounts = useMemo(() => {
    const counts = new Map<number, number>();
    users?.forEach((user) => {
      if (user.projectId != null) {
        counts.set(user.projectId, (counts.get(user.projectId) ?? 0) + 1);
      }
    });
    return counts;
  }, [users]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Проекты</h3>
          <p className="mt-2 text-sm text-slate-600">Создавайте проекты и переименовывайте их в модальном окне.</p>
        </div>

        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Создать проект
        </Button>
      </div>

      {projectsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить проекты.
          {typeof projectsFetchError === "object" && projectsFetchError && "data" in projectsFetchError ? (
            <div className="mt-2 text-sm text-rose-700">{String(projectsFetchError.data)}</div>
          ) : null}
        </section>
      ) : null}

      {projectsLoading ? <p className="text-sm text-slate-600">Загружаем проекты...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            memberCount={memberCounts.get(project.id) ?? 0}
            onClick={() => setActiveProjectId(project.id)}
          />
        ))}
      </div>

      <ProjectModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <ProjectModal open={Boolean(activeProject)} onClose={() => setActiveProjectId(null)} project={activeProject} />
    </section>
  );
}
