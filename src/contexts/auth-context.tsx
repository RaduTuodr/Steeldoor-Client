"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth-service";
import { tokenUtils } from "@/lib/token";
import type { User, LoginCredentials, RegisterCredentials } from "@/types/auth";
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = tokenUtils.getToken();
      if (!storedToken || tokenUtils.isExpired(storedToken)) {
        tokenUtils.removeToken();
        setIsBootstrapping(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setToken(storedToken);
        setUser(currentUser);
      } catch {
        tokenUtils.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    tokenUtils.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback(async (data: RegisterCredentials) => {
    await authService.register(data);
  }, []);

  const logout = useCallback(async () => {
    tokenUtils.removeToken();
    setToken(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  const setAuth = useCallback((newUser: User, newToken: string) => {
    tokenUtils.setToken(newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearAuth = useCallback(() => {
    tokenUtils.removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

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
