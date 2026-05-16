"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { authService } from "@/services/auth-service";
import { tokenUtils } from "@/lib/token";
import type { User, LoginCredentials, RegisterCredentials } from "@/types/auth";

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
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = toSessionUser(session?.user);
  const user = localUser ?? sessionUser;

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenUtils.getToken();
      if (!storedToken || tokenUtils.isExpired(storedToken)) {
        tokenUtils.removeToken();
        setToken(null);
        setLocalUser(null);
        setIsBootstrappingLocal(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setToken(storedToken);
        setLocalUser(currentUser);
      } catch {
        tokenUtils.removeToken();
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
    setToken(response.token);
    setLocalUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterCredentials) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    tokenUtils.removeToken();
    setToken(null);
    setLocalUser(null);
    await signOut({ redirect: false });
    router.replace("/login");
  }, [router]);

  const setAuth = useCallback((newUser: User, newToken: string) => {
    tokenUtils.setToken(newToken);
    setToken(newToken);
    setLocalUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    tokenUtils.removeToken();
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
