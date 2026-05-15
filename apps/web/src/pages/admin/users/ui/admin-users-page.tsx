import { useState } from "react";
import type { GetUsersInput } from "@/app/store/api/admin-api";
import { useGetProjectsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { Button } from "@/shared/ui/button";
import { SegmentedControl, SegmentedControlItem } from "@/shared/ui/segmented-control";
import { UserModal } from "@/features/user/manage-user";
import { UserUpdateCard } from "@/features/user/update-user";

const userTabs: Array<{ value: GetUsersInput; label: string }> = [
  { value: "active", label: "Активные" },
  { value: "archived", label: "Архив" },
];

export function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<GetUsersInput>("active");
  const { data: activeUsers, isLoading: activeUsersLoading, isError: activeUsersError, error: activeUsersFetchError } =
    useGetUsersQuery("active");
  const {
    data: archivedUsers,
    isLoading: archivedUsersLoading,
    isError: archivedUsersError,
    error: archivedUsersFetchError,
  } = useGetUsersQuery("archived");
  const { data: projects, isLoading: projectsLoading, isError: projectsError, error: projectsFetchError } =
    useGetProjectsQuery();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const users = activeTab === "active" ? activeUsers : archivedUsers;
  const usersLoading = activeTab === "active" ? activeUsersLoading : archivedUsersLoading;
  const usersError = activeTab === "active" ? activeUsersError : archivedUsersError;
  const usersFetchError = activeTab === "active" ? activeUsersFetchError : archivedUsersFetchError;

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
              Здесь можно управлять сотрудниками, их ролями, проектами и архивом пользователей.
            </p>
          </div>

          <Button type="button" onClick={() => setIsCreateOpen(true)}>
            Создать пользователя
          </Button>
        </div>
      </div>

      <SegmentedControl>
        {userTabs.map((tab) => (
          <SegmentedControlItem
            key={tab.value}
            type="button"
            active={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {usersError || projectsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить список пользователей.
          {usersError ? <div className="mt-2 text-sm text-rose-700">{getErrorMessage(usersFetchError)}</div> : null}
          {projectsError ? <div className="mt-2 text-sm text-rose-700">{getErrorMessage(projectsFetchError)}</div> : null}
        </section>
      ) : null}

      {usersLoading || projectsLoading ? <p className="text-sm text-slate-600">Загружаем данные...</p> : null}

      {!usersLoading && users?.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          {activeTab === "active" ? "Активных пользователей пока нет." : "Архив пользователей пуст."}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {users?.map((user) => (
          <UserUpdateCard key={user.id} user={user} projects={projects ?? []} mode={activeTab} />
        ))}
      </div>

      <UserModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} projects={projects ?? []} />
    </section>
  );
}
