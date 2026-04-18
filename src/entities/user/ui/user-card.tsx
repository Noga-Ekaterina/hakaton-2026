import type { KeyboardEvent, ReactNode } from "react";
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
  const role = roleMeta[user.role];

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
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Сотрудник #{user.id}</p>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{user.name}</h3>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>

      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className= {`rounded-2xl ${role.className} p-4`}>
          <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Роль</dt>
          <dd className="mt-2 text-sm font-medium text-slate-900">{role.label}</dd>
        </div>

        {(user.department && user.role !== "ADMIN") && (
          <div className="rounded-2xl bg-slate-100 p-4">
            <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Отдел</dt>
            <dd className="mt-2 text-sm font-medium text-slate-900">{user.department.name || "Не назначен"}</dd>
          </div>
        ) }
      </dl>

      {children ? <div className="mt-5 border-t border-slate-200 pt-5">{children}</div> : null}
    </article>
  );
}

