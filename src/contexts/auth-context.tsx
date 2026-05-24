"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { authService } from "@/services/auth-service";
import { tokenUtils } from "@/lib/token";
import type { User, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { useLocale } from "@/hooks/use-locale";
import { localizeHref } from "@/i18n/routing";

const SESSION_USER_KEY = "auth_user";

function toSessionUser(sessionUser: { email?: string | null; name?: string | null; image?: string | null } | undefined): User | null {
  if (!sessionUser?.email) {
    return null;
  }

  return {
    id: sessionUser.email,
    email: sessionUser.email,
    username: sessionUser.name?.trim() || sessionUser.email,
    createdAt: "",
  };
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<User>;
    if (!parsed.id || !parsed.email || !parsed.username) {
      return null;
    }

    return {
      id: String(parsed.id),
      email: String(parsed.email),
      username: String(parsed.username),
      createdAt: String(parsed.createdAt ?? ""),
    };
  } catch {
    return null;
  }
}

function setStoredUser(user: User | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (!user) {
      sessionStorage.removeItem(SESSION_USER_KEY);
      return;
    }

    sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
  } catch {
    console.warn("Failed to persist user in session storage");
  }
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isBootstrapping: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (data: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrappingLocal, setIsBootstrappingLocal] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = toSessionUser(session?.user);
  const user = localUser ?? sessionUser;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenUtils.getToken();
      const storedUser = getStoredUser();

      if (!storedToken || tokenUtils.isExpired(storedToken)) {
        tokenUtils.removeToken();
        setStoredUser(null);
        setToken(null);
        setLocalUser(null);
        setIsBootstrappingLocal(false);
        return;
      }

      if (storedUser) {
        setToken(storedToken);
        setIsBootstrappingLocal(false);
        setLocalUser(storedUser);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setToken(storedToken);
        setLocalUser(currentUser);
        setStoredUser(currentUser);
      } catch {
        tokenUtils.removeToken();
        setStoredUser(null);
        setToken(null);
        setLocalUser(null);
      } finally {
        setIsBootstrappingLocal(false);
      }
    };

    void initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    tokenUtils.setToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setLocalUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterCredentials) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    tokenUtils.removeToken();
    setStoredUser(null);
    setToken(null);
    setLocalUser(null);
    await signOut({ redirect: false });
    router.replace(localizeHref(locale, "/login"));
  }, [router, locale]);

  const setAuth = useCallback((newUser: User, newToken: string) => {
    tokenUtils.setToken(newToken);
    setStoredUser(newUser);
    setToken(newToken);
    setLocalUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    tokenUtils.removeToken();
    setStoredUser(null);
    setToken(null);
    setLocalUser(null);
  }, []);

  const isBootstrapping = isBootstrappingLocal || sessionStatus === "loading";
  const isAuthenticated = (!!token && !!localUser) || !!sessionUser;

  const value: AuthContextType = {
    user,
    token,
    isBootstrapping,
    isAuthenticated,
    login,
    register,
    logout,
    setAuth,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
