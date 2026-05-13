"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

/**
 * Hook for protecting routes that require authentication
 * Redirects to login if user is not authenticated
 */
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

/**
 * Hook for protecting routes that require authentication (with options)
 * @param options - Configuration options
 */
interface UseProtectedRouteOptions {
  /** URL to redirect to if not authenticated (default: /login) */
  redirectTo?: string;
  /** Whether to store the original URL for post-login redirect */
  storeOriginalUrl?: boolean;
  /** Callback to run when access is denied */
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

/**
 * Hook for routes that should only be accessible to unauthenticated users
 * (e.g., login, register pages)
 * Redirects to dashboard/home if already authenticated
 */
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
