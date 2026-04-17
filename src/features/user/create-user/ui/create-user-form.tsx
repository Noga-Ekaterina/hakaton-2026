import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "@/app/store/api/admin-api";
import type { Department } from "@/entities/department";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createUserSchema, type CreateUserValues } from "../model/create-user-schema";

type CreateUserFormProps = {
  departments: Department[];
};

export function CreateUserForm({ departments }: CreateUserFormProps) {
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
      departmentId: "",
    },
  });

  const selectedDepartmentId = watch("departmentId");
  const selectedRole = watch("role");

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      if (selectedDepartmentId) {
        setValue("departmentId", "", { shouldValidate: true });
      }
      return;
    }

    if (!selectedDepartmentId && departments[0]?.id) {
      setValue("departmentId", String(departments[0].id), { shouldValidate: true });
    }
  }, [departments, selectedDepartmentId, selectedRole, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const departmentId = values.role === "ADMIN" ? null : Number(values.departmentId);
    const departmentName =
      values.role === "ADMIN" ? null : departments.find((department) => department.id === departmentId)?.name ?? "";

    try {
      await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        departmentId,
        departmentName,
      }).unwrap();
      reset({
        name: "",
        email: "",
        password: "",
        role: "USER",
        departmentId: String(departments[0]?.id ?? ""),
      });
    } catch {
      setSubmitError("Не удалось создать пользователя. Проверьте соединение с mock-API.");
    }
  });

  return (
    <form
      className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm"
      onSubmit={onSubmit}
      noValidate
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Новый пользователь</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Создать пользователя</h2>
        <p className="mt-2 text-sm text-slate-600">
          Пользователь попадет в выбранный отдел и сразу будет доступен для редактирования.
        </p>
      </div>

      {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="user-name">Имя</Label>
          <Input id="user-name" placeholder="Иван Петров" aria-invalid={Boolean(errors.name)} {...register("name")} />
          {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-email">Email</Label>
          <Input
            id="user-email"
            type="email"
            placeholder="user@company.ru"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
          {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-password">Пароль</Label>
          <Input
            id="user-password"
            type="password"
            autoComplete="new-password"
            placeholder="Минимум 6 символов"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="user-role">Роль</Label>
          <select
            id="user-role"
            className="h-11 w-full rounded-2xl border border-border bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-invalid={Boolean(errors.role)}
            {...register("role")}
          >
            <option value="USER">Пользователь</option>
            <option value="ADMIN">Администратор</option>
          </select>
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>

        {selectedRole === "ADMIN" ? null : (
          <div className="space-y-2">
            <Label htmlFor="user-department">Отдел</Label>
            <select
              id="user-department"
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
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
        {isSubmitting || isLoading ? "Создаём..." : "Создать пользователя"}
      </Button>
    </form>
  );
}
