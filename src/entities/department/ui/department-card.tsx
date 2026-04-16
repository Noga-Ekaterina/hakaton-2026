import type { KeyboardEvent } from "react";
import type { Department } from "../model/types";

type DepartmentCardProps = {
  department: Department;
  memberCount: number;
  onClick?: () => void;
};

export function DepartmentCard({ department, memberCount, onClick }: DepartmentCardProps) {
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
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Отдел #{department.id}</p>
      <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{department.name}</h3>
      <div className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {memberCount} сотрудников
      </div>
    </article>
  );
}
