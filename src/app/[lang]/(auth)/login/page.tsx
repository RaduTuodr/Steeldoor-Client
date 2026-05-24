import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { AuthCard } from "@/components/auth/auth-card";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function LoginPage({
  params,
}: PageProps<"/[lang]/login">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthCard
        title={dict.auth.loginTitle}
        description={dict.auth.loginDescription}
      >
        <Suspense
          fallback={<div className="py-6 text-center text-sm text-zinc-500">{dict.auth.loadingAccessForm}</div>}
        >
          <LoginForm />
        </Suspense>
      </AuthCard>

      <p className="text-center text-sm text-zinc-500">
        {dict.auth.noAccount}{" "}
        <Link
          href={`/${lang}/register`}
          className="font-medium text-zinc-300 transition-colors duration-200 hover:text-zinc-100"
        >
          {dict.auth.createOne}
        </Link>
      </p>
    </div>
  );
}
