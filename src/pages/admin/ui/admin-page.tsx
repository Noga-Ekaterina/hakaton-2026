import { useMemo } from "react";
import { CreateDepartmentForm } from "@/features/department/create-department";
import { CreateUserForm } from "@/features/user/create-user";
import { UserUpdateCard } from "@/features/user/update-user";
import { useGetDepartmentsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { DepartmentCard } from "@/entities/department";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "data" in error) {
    return String((error as { data: unknown }).data);
  }

  return null;
}

export function AdminPage() {
  const { data: users, isLoading: usersLoading, isError: usersError, error: usersFetchError } = useGetUsersQuery();
  const {
    data: departments,
    isLoading: departmentsLoading,
    isError: departmentsError,
    error: departmentsFetchError,
  } = useGetDepartmentsQuery();

  const memberCounts = useMemo(() => {
    const counts = new Map<number, number>();
    users?.forEach((user) => {
      if (user.departmentId != null) {
        counts.set(user.departmentId, (counts.get(user.departmentId) ?? 0) + 1);
      }
    });
    return counts;
  }, [users]);

  const totalUsers = users?.length ?? 0;
  const totalDepartments = departments?.length ?? 0;
  const adminCount = users?.filter((user) => user.role === "ADMIN").length ?? 0;

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Администрирование</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Отделы, пользователи и роли</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
          Здесь можно создавать отделы, заводить новых сотрудников, назначать роли и переводить сотрудников между
          подразделениями. Все изменения сохраняются в mock-API.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Пользователи</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{totalUsers}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Отделы</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{totalDepartments}</p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Менеджеры</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{adminCount}</p>
          </div>
        </div>
      </div>

      {usersError || departmentsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить данные админки.
          {usersError ? <div className="mt-2 text-sm text-rose-700">{getErrorMessage(usersFetchError)}</div> : null}
          {departmentsError ? (
            <div className="mt-2 text-sm text-rose-700">{getErrorMessage(departmentsFetchError)}</div>
          ) : null}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-6">
          <CreateDepartmentForm />
          <CreateUserForm departments={departments ?? []} />
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">Список пользователей</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Меняйте роль и отдел прямо в карточке. После сохранения данные подтянутся заново из API.
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                {totalUsers} записей
              </span>
            </div>

            {usersLoading ? <p className="mt-5 text-sm text-slate-600">Загружаем пользователей...</p> : null}

            {users ? (
              <div className="mt-5 grid gap-4">
                {users.map((user) => (
                  <UserUpdateCard key={user.id} user={user} departments={departments ?? []} />
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white to-amber-50 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-slate-950">Список отделов</h3>
                <p className="mt-2 text-sm text-slate-600">Отделы нужны для создания и перевода сотрудников.</p>
              </div>
              <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
                {totalDepartments} записей
              </span>
            </div>

            {departmentsLoading ? <p className="mt-5 text-sm text-slate-600">Загружаем отделы...</p> : null}

            {departments ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {departments.map((department) => (
                  <DepartmentCard
                    key={department.id}
                    department={department}
                    memberCount={memberCounts.get(department.id) ?? 0}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </section>
  );
}
