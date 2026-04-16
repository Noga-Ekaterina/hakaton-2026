import { useState } from "react";
import { useGetDepartmentsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { UserCard } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { UserModal } from "@/features/user/manage-user";

export function AdminUsersPage() {
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersFetchError } = useGetUsersQuery();
  const { data: departments, isLoading: departmentsLoading } = useGetDepartmentsQuery();
  const [activeUserId, setActiveUserId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeUser = users?.find((user) => user.id === activeUserId) ?? null;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Пользователи</h3>
          <p className="mt-2 text-sm text-slate-600">
            Создавайте сотрудников и меняйте их роль или отдел в модальном окне.
          </p>
        </div>

        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Создать пользователя
        </Button>
      </div>

      {usersError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить пользователей.
          {typeof usersFetchError === "object" && usersFetchError && "data" in usersFetchError ? (
            <div className="mt-2 text-sm text-rose-700">{String(usersFetchError.data)}</div>
          ) : null}
        </section>
      ) : null}

      {usersLoading || departmentsLoading ? <p className="text-sm text-slate-600">Загружаем данные...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {users?.map((user) => (
          <UserCard key={user.id} user={user} onClick={() => setActiveUserId(user.id)} />
        ))}
      </div>

      <UserModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        departments={departments ?? []}
      />
      <UserModal
        open={Boolean(activeUser)}
        onClose={() => setActiveUserId(null)}
        departments={departments ?? []}
        user={activeUser}
      />
    </section>
  );
}
