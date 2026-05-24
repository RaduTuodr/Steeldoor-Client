import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { NextAuthSessionProvider } from "@/components/providers/session-provider";
import { AppShell } from "@/components/layout/app-shell";
import { getValidLocale, localeCookieName } from "@/i18n/config";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getDictionary } from "@/i18n/get-dictionary";

export const metadata: Metadata = {
  title: {
    default: "Steeldoor",
    template: "%s | Steeldoor",
  },
  description: "Modern workspace client with authentication and directory views.",
};

function NavbarFallback() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl" />
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = getValidLocale(cookieStore.get(localeCookieName)?.value);
  
  // Fetch the localization dictionary server-side using the resolved locale
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">
        <NextAuthSessionProvider>
          <QueryProvider>
            <AuthProvider>
              <ToastProvider>
                {/* Fixed the typo from </I18NProvider> to </I18nProvider> and added props */}
                <I18nProvider dictionary={dictionary} locale={locale}>
                  <Suspense fallback={<NavbarFallback />}>
                    <AppShell>{children}</AppShell>
                  </Suspense>
                </I18nProvider>
                <Toaster />
              </ToastProvider>
            </AuthProvider>
          </QueryProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}