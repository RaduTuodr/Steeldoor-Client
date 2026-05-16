"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function useProtectedRoute(): void {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      const query = searchParams.toString();
      const redirectPath = query ? `${pathname}?${query}` : pathname;
      const redirectUrl = encodeURIComponent(redirectPath);

      router.replace(`/login?redirect=${redirectUrl}`);
    }
  }, [isAuthenticated, isBootstrapping, router, pathname, searchParams]);
}

interface UseProtectedRouteOptions {
  redirectTo?: string;
  storeOriginalUrl?: boolean;
  onAccessDenied?: () => void;
}

export function useProtectedRouteWithOptions(options: UseProtectedRouteOptions = {}): void {
  const { redirectTo = "/login", storeOriginalUrl = true, onAccessDenied } = options;
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      if (storeOriginalUrl && pathname) {
        const query = searchParams.toString();
        const redirectPath = query ? `${pathname}?${query}` : pathname;
        const redirectUrl = encodeURIComponent(redirectPath);

        router.replace(`${redirectTo}?redirect=${redirectUrl}`);
      } else {
        router.replace(redirectTo);
      }

      onAccessDenied?.();
    }
  }, [isAuthenticated, isBootstrapping, router, pathname, searchParams, redirectTo, storeOriginalUrl, onAccessDenied]);
}

export function useGuestRoute(defaultRedirect: string = "/"): void {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");
      router.replace(redirect || defaultRedirect);
    }
  }, [isAuthenticated, isBootstrapping, router, defaultRedirect]);
}

export default useProtectedRoute;
