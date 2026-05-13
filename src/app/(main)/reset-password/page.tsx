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

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, isBootstrapping, isAuthenticated } = useAuth();
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
      setSendError(parsed.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }

    setIsSending(true);
    try {
      await authService.requestPasswordChange(user.id, parsed.data);
      setCodeSent(true);
      toast({
        title: "Code sent",
        description: "Check your phone for the SMS verification code.",
        variant: "success",
      });
    } catch (error) {
      setSendError(
        error instanceof Error
          ? error.message
          : "Could not send the verification code. Try again."
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
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "success",
      });
      router.push("/profile");
    } catch (error) {
      toast({
        title: "Could not reset password",
        description:
          error instanceof Error
            ? error.message
            : "The code may be wrong or expired. Request a new code and try again.",
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
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reset password</h1>

      <Card className="mt-8 border-zinc-800/80 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>SMS verification</CardTitle>
          <CardDescription>
            We send a code to your phone. Enter it below with your new password. Codes expire after a few
            minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <AuthInput
              id="reset-phone"
              name="phone"
              label="Phone number"
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
              {codeSent ? "Resend SMS code" : "Send SMS code"}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onConfirmSubmit)} className="space-y-4 border-t border-zinc-800/80 pt-6">
            <AuthInput
              {...register("code")}
              id="reset-code"
              label="SMS code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter the code"
              error={errors.code?.message}
              disabled={isSubmitting}
            />
            <AuthInput
              {...register("newPassword")}
              id="reset-new-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              error={errors.newPassword?.message}
              disabled={isSubmitting}
            />
            <AuthInput
              {...register("confirmPassword")}
              id="reset-confirm-password"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
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
                Update password
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href="/profile">Back to profile</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
