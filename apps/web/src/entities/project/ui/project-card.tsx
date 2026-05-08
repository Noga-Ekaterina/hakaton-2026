import type { KeyboardEvent } from "react";
import type { Project } from "../model/types";

type ProjectCardProps = {
  project: Project;
  memberCount?: number;
  onClick?: () => void;
};

export function ProjectCard({ project, memberCount, onClick }: ProjectCardProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <article
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm transition ${
        onClick ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-primary/30" : ""
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Проект #{project.id}</p>
      <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{project.name}</h3>
      {typeof memberCount === "number" ? (
        <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {memberCount} сотрудников
        </div>
      ) : null}
    </article>
  );
}
