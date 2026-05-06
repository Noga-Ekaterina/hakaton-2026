import type { KeyboardEvent, ReactNode } from "react";
import { useAppSelector } from "@/app/store/hooks";
import { getUserDisplayName } from "../model/user-display";
import type { User } from "../model/types";

const roleMeta: Record<User["role"], { label: string; className: string }> = {
  USER: {
    label: "Пользователь",
    className: "bg-slate-100 text-slate-700",
  },
  ADMIN: {
    label: "Администратор",
    className: "bg-emerald-100 text-emerald-900",
  },
};

type UserCardProps = {
  user: User;
  children?: ReactNode;
  onClick?: () => void;
};

export function UserCard({ user, children, onClick }: UserCardProps) {
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const role = roleMeta[user.role];
  const projects = user.projects ?? [];
  const userName = getUserDisplayName(user, currentUserId);

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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Сотрудник #{user.id}</p>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${role.className}`}>
          {role.label}
        </span>
      </div>

      <div>
        <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{userName}</h3>
        <p className="mt-1 text-sm text-slate-600">{user.email}</p>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Проекты</dt>
          <dd className="mt-2">
            {projects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {projects.map((project) => (
                  <span key={project.id} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-900 shadow-sm">
                    {project.name}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-500">{user.role === "USER" ? "Нет проектов" : "Все проекты"}</span>
            )}
          </dd>
        </div>
      </dl>

      {children ? <div className="mt-5 border-t border-slate-200 pt-5">{children}</div> : null}
    </article>
  );
}
