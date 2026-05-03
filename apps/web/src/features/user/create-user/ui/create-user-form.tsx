import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateUserMutation } from "@/app/store/api/admin-api";
import type { Project } from "@/entities/project";
import type { UserRole } from "@/entities/user";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { OptionSelect } from "@/shared/ui/option-select";
import { createUserSchema, type CreateUserValues } from "../model/create-user-schema";

type CreateUserFormProps = {
  projects: Project[];
};

const roleOptions = [
  { value: "USER", label: "Пользователь" },
  { value: "ADMIN", label: "Администратор" },
] satisfies Array<{ value: UserRole; label: string }>;

export function CreateUserForm({ projects }: CreateUserFormProps) {
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
      projectId: "",
    },
  });

  const selectedProjectId = watch("projectId");
  const selectedRole = watch("role");

  useEffect(() => {
    if (selectedRole === "ADMIN") {
      if (selectedProjectId) {
        setValue("projectId", "", { shouldValidate: true });
      }
      return;
    }

    if (!selectedProjectId && projects[0]?.id) {
      setValue("projectId", String(projects[0].id), { shouldValidate: true });
    }
  }, [projects, selectedProjectId, selectedRole, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const projectId = values.role === "ADMIN" ? null : Number(values.projectId);
    const projectName = values.role === "ADMIN" ? null : projects.find((project) => project.id === projectId)?.name ?? "";

    try {
      await createUser({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        projectId,
        projectName,
      }).unwrap();
      reset({
        name: "",
        email: "",
        password: "",
        role: "USER",
        projectId: String(projects[0]?.id ?? ""),
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
      <input type="hidden" {...register("role")} />
      <input type="hidden" {...register("projectId")} />

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Новый пользователь</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Создать пользователя</h2>
        <p className="mt-2 text-sm text-slate-600">
          Пользователь попадет в выбранный проект и сразу будет доступен для редактирования.
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
          <OptionSelect
            id="user-role"
            selectionMode="single"
            clearable={false}
            value={selectedRole}
            onChange={(value) => setValue("role", value as UserRole, { shouldDirty: true, shouldValidate: true })}
            options={roleOptions}
            triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
          />
          {errors.role ? <p className="text-sm text-rose-600">{errors.role.message}</p> : null}
        </div>

        {selectedRole === "ADMIN" ? null : (
          <div className="space-y-2">
            <Label htmlFor="user-project">Проект</Label>
            <OptionSelect
              id="user-project"
              selectionMode="single"
              clearable={false}
              options={projects.map((project) => ({ value: String(project.id), label: project.name }))}
              emptyLabel="Выберите проект"
              value={selectedProjectId ?? ""}
              onChange={(value) => setValue("projectId", value, { shouldDirty: true, shouldValidate: true })}
              triggerClassName="border-border bg-white hover:bg-white focus-visible:ring-primary/20"
            />
            {errors.projectId ? <p className="text-sm text-rose-600">{errors.projectId.message}</p> : null}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
        {isSubmitting || isLoading ? "Создаём..." : "Создать пользователя"}
      </Button>
    </form>
  );
}
