import { useMemo, useState } from "react";
import { useGetDepartmentsQuery, useGetUsersQuery } from "@/app/store/api/admin-api";
import { DepartmentCard } from "@/entities/department";
import { Button } from "@/shared/ui/button";
import { DepartmentModal } from "@/features/department/manage-department";

export function AdminDepartmentsPage() {
  const { data: departments, isLoading: departmentsLoading, isError: departmentsError, error: departmentsFetchError } =
    useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const [activeDepartmentId, setActiveDepartmentId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeDepartment = departments?.find((department) => department.id === activeDepartmentId) ?? null;
  const memberCounts = useMemo(() => {
    const counts = new Map<number, number>();
    users?.forEach((user) => {
      if (user.departmentId != null) {
        counts.set(user.departmentId, (counts.get(user.departmentId) ?? 0) + 1);
      }
    });
    return counts;
  }, [users]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-950">Отделы</h3>
          <p className="mt-2 text-sm text-slate-600">
            Создавайте отделы и переименовывайте их в модальном окне.
          </p>
        </div>

        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          Создать отдел
        </Button>
      </div>

      {departmentsError ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          Не удалось загрузить отделы.
          {typeof departmentsFetchError === "object" && departmentsFetchError && "data" in departmentsFetchError ? (
            <div className="mt-2 text-sm text-rose-700">{String(departmentsFetchError.data)}</div>
          ) : null}
        </section>
      ) : null}

      {departmentsLoading ? <p className="text-sm text-slate-600">Загружаем отделы...</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {departments?.map((department) => (
          <DepartmentCard
            key={department.id}
            department={department}
            memberCount={memberCounts.get(department.id) ?? 0}
            onClick={() => setActiveDepartmentId(department.id)}
          />
        ))}
      </div>

      <DepartmentModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <DepartmentModal
        open={Boolean(activeDepartment)}
        onClose={() => setActiveDepartmentId(null)}
        department={activeDepartment}
      />
    </section>
  );
}
