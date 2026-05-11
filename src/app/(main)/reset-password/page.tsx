"use client";

import Link from "next/link";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResetPasswordPage() {
  const { isBootstrapping, isAuthenticated } = useAuth();
  useProtectedRoute();

  if (isBootstrapping) {
    return (
      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">Reset password</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Wire this screen to your Spring Boot password reset flow (email token, OTP, or authenticated change).
      </p>

      <Card className="mt-8 border-zinc-800/80 bg-zinc-900/40">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            The UI shell is ready: add a form that posts to your backend and handles success and error states.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" disabled>
            Send reset link
          </Button>
          <Button type="button" variant="ghost" asChild>
            <Link href="/profile">Back to profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
