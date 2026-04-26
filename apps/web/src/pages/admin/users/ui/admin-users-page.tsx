import { useState } from "react";
import { useGetProjectsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { Button } from "@/shared/ui/button";
import { UserModal } from "@/features/user/manage-user";
import { UserUpdateCard } from "@/features/user/update-user";

export function AdminUsersPage() {
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersFetchError } = useGetUsersQuery();
  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsFetchError } =
    useGetProjectsQuery();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const getErrorMessage = (error: unknown) =>
    typeof error === "object" && error && "data" in error ? String((error as { data: unknown }).data) : null;

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Администрирование</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Пользователи</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Здесь можно управлять сотрудниками, их ролями и привязкой к проектам.
            </p>
          </div>

          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            Создать пользователя
          </Button>
        </div>
      </div>

      {usersError || projectsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить список пользователей.
          {usersError ? <div className="mt-2 text-sm text-rose-700">{getErrorMessage(usersFetchError)}</div> : null}
          {projectsError ? <div className="mt-2 text-sm text-rose-700">{getErrorMessage(projectsFetchError)}</div> : null}
        </section>
      ) : null}

      {usersLoading || projectsLoading ? <p className="text-sm text-slate-600">Загружаем данные...</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        {users?.map((user) => <UserUpdateCard key={user.id} user={user} projects={projects ?? []} />)}
      </div>

      <UserModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} projects={projects ?? []} />
    </section>
  );
}
