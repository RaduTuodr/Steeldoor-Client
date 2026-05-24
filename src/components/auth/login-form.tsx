"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useGuestRoute } from "@/hooks/use-protected-route";
import { toast } from "@/hooks/use-toast";
import { loginSchema, type LoginFormValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/i18n-provider";
import { AuthInput } from "./auth-input";
import { OAuthButtons } from "./oauth-buttons";

const FIELD_NAMES = {
  email: "email",
  password: "password",
} as const;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dictionary } = useI18n();
  const redirectUrl = searchParams.get("redirect") || "/";

  useGuestRoute();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);

    try {
      const user = await login(data);
      toast({
        title: dictionary.auth.signedIn,
        description: dictionary.auth.welcomeBack.replace("{name}", user.username || user.email),
        variant: "success",
      });
      router.push(redirectUrl);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : dictionary.auth.loginFailed
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        {...register(FIELD_NAMES.email)}
        id={FIELD_NAMES.email}
        label={dictionary.auth.email}
        type="email"
        placeholder={dictionary.auth.emailPlaceholder}
        autoComplete="email"
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <AuthInput
        {...register(FIELD_NAMES.password)}
        id={FIELD_NAMES.password}
        label={dictionary.auth.password}
        type="password"
        placeholder={dictionary.auth.passwordPlaceholder}
        autoComplete="current-password"
        error={errors.password?.message}
        disabled={isSubmitting}
      />

      {serverError && (
        <div
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-1"
          role="alert"
        >
          {serverError}
        </div>
      )}

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {dictionary.auth.signInButton}
      </Button>

      <OAuthButtons />

      <div className="text-center">
        <a
          href="#"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
        >
          {dictionary.auth.forgotPassword}
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
