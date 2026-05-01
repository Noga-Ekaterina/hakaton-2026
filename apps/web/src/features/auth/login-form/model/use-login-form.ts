import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/app/store/auth-slice";
import { useAppDispatch } from "@/app/store/hooks";
import { paths } from "@/shared/config/routes";
import { loginSchema, type LoginValues } from "./login-schema";

export function useLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginValues) => {
    setSubmitError(null);

    try {
      await dispatch(loginUser(data)).unwrap();
      navigate(paths.home, { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error));
    }
  };

  return {
    form,
    onSubmit,
    showPassword,
    submitError,
    togglePasswordVisibility: () => setShowPassword((value) => !value),
  };
}
