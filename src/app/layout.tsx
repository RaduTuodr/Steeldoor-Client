import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Steeldoor",
  description: "Modern authentication system built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-zinc-950 text-zinc-100 antialiased">
        <AuthProvider>
          <ToastProvider>
            {children}
            <Toaster />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
