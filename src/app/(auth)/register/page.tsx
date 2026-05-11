import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";

export const metadata = {
  title: "Create Account | Steeldoor",
  description: "Create a new Steeldoor account",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <AuthCard
        title="Create an account"
        description="Set up your workspace access in a few seconds."
      >
        <RegisterForm />
      </AuthCard>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-zinc-300 hover:text-zinc-100 font-medium transition-colors duration-200"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
