import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useUpdateUserMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import { UserCard } from "@/entities/user";
import type { User } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { updateUserSchema, type UpdateUserValues } from "../model/update-user-schema";

type UserUpdateCardProps = {
  user: User;
  departments: Department[];
};

export function UserUpdateCard({ user, departments }: UserUpdateCardProps) {
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      role: user.role,
      departmentId: String(user.departmentId),
    },
  });

  const selectedDepartmentId = watch("departmentId");

  useEffect(() => {
    if (!selectedDepartmentId && departments[0]?.id) {
      setValue("departmentId", String(departments[0].id), { shouldValidate: true });
    }
  }, [departments, selectedDepartmentId, setValue]);

  useEffect(() => {
    reset({
      role: user.role,
      departmentId: String(user.departmentId),
    });
  }, [reset, user.departmentId, user.role]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const departmentId = Number(values.departmentId);
    const departmentName = departments.find((department) => department.id === departmentId)?.name ?? user.departmentName;

    try {
      await updateUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: values.role,
        departmentId,
        departmentName,
      }).unwrap();
    } catch {
      setSubmitError("Не удалось обновить пользователя.");
    }
  });

  return (
    <UserCard user={user}>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor={`role-${user.id}`}>Роль</Label>
            <select
              id={`role-${user.id}`}
              className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.role)}
            {...register("role")}
          >
            <option value="EMPLOYEE">Сотрудник</option>
            <option value="MANAGER">Менеджер</option>
          </select>
            {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`department-${user.id}`}>Отдел</Label>
            <select
              id={`department-${user.id}`}
              className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-invalid={Boolean(errors.departmentId)}
              {...register("departmentId")}
            >
              <option value="">Выберите отдел</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.departmentId ? <p className="text-sm text-rose-600">{errors.departmentId.message}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button type="submit" disabled={isSubmitting || isLoading}>
            {isSubmitting || isLoading ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </UserCard>
  );
}
