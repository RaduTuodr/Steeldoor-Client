"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useGuestRoute } from "@/hooks/use-protected-route";
import { toast } from "@/hooks/use-toast";
import { registerSchema, type RegisterFormValues } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref } from "@/i18n/routing";
import { AuthInput } from "./auth-input";
import { OAuthButtons } from "./oauth-buttons";

const FIELD_NAMES = {
  username: "username",
  email: "email",
  password: "password",
  confirmPassword: "confirmPassword",
} as const;

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const { dictionary } = useI18n();
  const locale = useLocale();

  useGuestRoute();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);

    try {
      await registerUser(data);
      toast({
        title: dictionary.auth.accountCreated,
        description: dictionary.auth.accountCreatedDescription,
        variant: "success",
      });
      router.push(localizeHref(locale, "/login"));
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : dictionary.auth.registrationFailed
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        {...register(FIELD_NAMES.username)}
        id={FIELD_NAMES.username}
        label={dictionary.auth.username}
        type="text"
        placeholder={dictionary.auth.usernamePlaceholder}
        autoComplete="username"
        error={errors.username?.message}
        disabled={isSubmitting}
        helperText={dictionary.auth.usernameHelper}
      />

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
        placeholder={dictionary.auth.newPasswordPlaceholder}
        autoComplete="new-password"
        error={errors.password?.message}
        disabled={isSubmitting}
        helperText={dictionary.auth.passwordHelper}
      />

      <AuthInput
        {...register(FIELD_NAMES.confirmPassword)}
        id={FIELD_NAMES.confirmPassword}
        label={dictionary.auth.confirmPassword}
        type="password"
        placeholder={dictionary.auth.confirmPasswordPlaceholder}
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
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
        {dictionary.auth.createAccountButton}
      </Button>

      <OAuthButtons />
    </form>
  );
}

export default RegisterForm;
