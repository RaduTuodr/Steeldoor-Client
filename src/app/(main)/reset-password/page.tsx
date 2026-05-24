"use client";

import Link from "next/link";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/services/auth-service";
import { toast } from "@/hooks/use-toast";
import {
  passwordResetConfirmSchema,
  passwordResetPhoneSchema,
  type PasswordResetConfirmFormValues,
} from "@/lib/validation/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthInput } from "@/components/auth/auth-input";
import { useI18n } from "@/components/i18n/i18n-provider";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref } from "@/i18n/routing";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, isBootstrapping, isAuthenticated } = useAuth();
  const { dictionary } = useI18n();
  const locale = useLocale();
  const [phoneNumber, setPhoneNumber] = React.useState("+40");
  const [codeSent, setCodeSent] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const [isSending, setIsSending] = React.useState(false);

  useProtectedRoute();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetConfirmForm,
  } = useForm<PasswordResetConfirmFormValues>({
    resolver: zodResolver(passwordResetConfirmSchema),
    mode: "onBlur",
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleSendSmsCode = async () => {
    setSendError(null);
    if (!user) {
      return;
    }

    const parsed = passwordResetPhoneSchema.safeParse(phoneNumber);
    if (!parsed.success) {
      setSendError(parsed.error.issues[0]?.message ?? dictionary.resetPassword.invalidPhone);
      return;
    }

    setIsSending(true);
    try {
      await authService.requestPasswordChange(user.id, parsed.data);
      setCodeSent(true);
      toast({
        title: dictionary.resetPassword.codeSent,
        description: dictionary.resetPassword.checkPhone,
        variant: "success",
      });
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : dictionary.resetPassword.codeSendFailed
      );
    } finally {
      setIsSending(false);
    }
  };

  const onConfirmSubmit = async (data: PasswordResetConfirmFormValues) => {
    if (!user) {
      return;
    }

    try {
      await authService.confirmPasswordChange(user.id, data.code, data.newPassword);
      resetConfirmForm();
      toast({
        title: dictionary.resetPassword.passwordUpdated,
        description: dictionary.resetPassword.passwordUpdatedDescription,
        variant: "success",
      });
      router.push(localizeHref(locale, "/profile"));
    } catch (error) {
      toast({
        title: dictionary.resetPassword.resetFailed,
        description:
          error instanceof Error
            ? error.message
            : dictionary.resetPassword.resetFailedDescription,
        variant: "destructive",
      });
    }
  };

  if (isBootstrapping) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{dictionary.resetPassword.title}</h1>

      <Card className="mt-8 border-zinc-800/80 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>{dictionary.resetPassword.verificationTitle}</CardTitle>
          <CardDescription>{dictionary.resetPassword.verificationDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <AuthInput
              id="reset-phone"
              name="phone"
              label={dictionary.resetPassword.phoneNumber}
              type="tel"
              autoComplete="tel"
              placeholder="+40 7xx xxx xxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isSending}
            />
            {sendError && (
              <p className="text-sm text-red-400" role="alert">
                {sendError}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void handleSendSmsCode()}
              isLoading={isSending}
              disabled={isSending}
            >
              {codeSent ? dictionary.resetPassword.resendSmsCode : dictionary.resetPassword.sendSmsCode}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onConfirmSubmit)} className="space-y-4 border-t border-zinc-800/80 pt-6">
            <AuthInput
              {...register("code")}
              id="reset-code"
              label={dictionary.resetPassword.smsCode}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder={dictionary.resetPassword.enterCode}
              error={errors.code?.message}
              disabled={isSubmitting}
            />
            <AuthInput
              {...register("newPassword")}
              id="reset-new-password"
              label={dictionary.resetPassword.newPassword}
              type="password"
              autoComplete="new-password"
              placeholder={dictionary.auth.newPasswordPlaceholder}
              error={errors.newPassword?.message}
              disabled={isSubmitting}
            />
            <AuthInput
              {...register("confirmPassword")}
              id="reset-confirm-password"
              label={dictionary.resetPassword.confirmNewPassword}
              type="password"
              autoComplete="new-password"
              placeholder={dictionary.resetPassword.repeatNewPassword}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                type="submit"
                className="rounded-xl bg-zinc-100 text-zinc-900 hover:bg-white"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {dictionary.resetPassword.updatePassword}
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href={localizeHref(locale, "/profile")}>{dictionary.resetPassword.backToProfile}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
