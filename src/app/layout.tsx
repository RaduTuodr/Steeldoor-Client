import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppShell } from "@/components/layout/app-shell";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<NavbarFallback />}>
                <AppShell>{children}</AppShell>
              </Suspense>
              <Toaster />
            </ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
