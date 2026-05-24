import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function RegisterPage({
  params,
}: PageProps<"/[lang]/register">) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div className="w-full max-w-md space-y-6">
      <AuthCard
        title={dict.auth.registerTitle}
        description={dict.auth.registerDescription}
      >
        <RegisterForm />
      </AuthCard>

      <p className="text-center text-sm text-zinc-500">
        {dict.auth.alreadyHaveAccount}{" "}
        <Link
          href={`/${lang}/login`}
          className="font-medium text-zinc-300 transition-colors duration-200 hover:text-zinc-100"
        >
          {dict.auth.signInLink}
        </Link>
      </p>
    </div>
  );
}
