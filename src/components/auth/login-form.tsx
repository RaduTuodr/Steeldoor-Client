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
        title: "Signed in",
        description: `Welcome back, ${user.username || user.email}.`,
        variant: "success",
      });
      router.push(redirectUrl);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Login failed. Check your credentials and try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <AuthInput
        {...register(FIELD_NAMES.email)}
        id={FIELD_NAMES.email}
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        disabled={isSubmitting}
      />

      <AuthInput
        {...register(FIELD_NAMES.password)}
        id={FIELD_NAMES.password}
        label="Password"
        type="password"
        placeholder="Enter your password"
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
        Sign in
      </Button>

      <OAuthButtons />

      <div className="text-center">
        <a
          href="#"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;
