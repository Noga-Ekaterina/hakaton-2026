import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateDepartmentMutation } from "@/app/store/api/admin-api";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { createDepartmentSchema, type CreateDepartmentValues } from "../model/create-department-schema";

export function CreateDepartmentForm() {
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDepartmentValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    try {
      await createDepartment({ name: values.name.trim() }).unwrap();
      reset();
    } catch {
      setSubmitError("Не удалось создать отдел. Проверьте соединение с mock-API.");
    }
  });

  return (
    <form className="space-y-5 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm" onSubmit={onSubmit} noValidate>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Новый отдел</p>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Создать отдел</h2>
        <p className="mt-2 text-sm text-slate-600">Добавьте новый отдел, и он сразу появится в списках пользователей.</p>
      </div>

      {submitError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</p> : null}

      <div className="space-y-2">
        <Label htmlFor="department-name">Название отдела</Label>
        <Input
          id="department-name"
          placeholder="Например, Финансы"
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name ? <p className="text-sm text-rose-600">{errors.name.message}</p> : null}
      </div>

      <Button type="submit" disabled={isSubmitting || isLoading} className="w-full">
        {isSubmitting || isLoading ? "Создаём..." : "Создать отдел"}
      </Button>
    </form>
  );
}

