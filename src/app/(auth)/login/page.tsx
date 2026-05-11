import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata = {
  title: "Sign In | Steeldoor",
  description: "Sign in to your Steeldoor account",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <AuthCard
        title="Welcome back"
        description="Sign in with your email and password to continue."
      >
        <Suspense
          fallback={<div className="py-6 text-center text-sm text-zinc-500">Loading access form...</div>}
        >
          <LoginForm />
        </Suspense>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors duration-200"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
