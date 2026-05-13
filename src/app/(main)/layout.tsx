"use client";

import { useAuth } from "@/contexts/auth-context";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  useProtectedRoute();

  if (isBootstrapping) {
    return <div className="min-h-[calc(100vh-3.5rem)]" />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div className="min-h-[calc(100vh-3.5rem)]">{children}</div>;
}
