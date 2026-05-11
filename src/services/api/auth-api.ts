import { apiClient } from "@/services/api/client";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  me: "/api/auth/me",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
} as const;

export const authApi = {
  async login(payload: LoginCredentials) {
    return await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.login, payload);
  },
  register(payload: RegisterCredentials) {
    return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.register, payload);
  },
  me() {
    return apiClient.get<{ user: User } | AuthResponse>(AUTH_ENDPOINTS.me);
  },
  refresh() {
    return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.refresh);
  },
  logout() {
    return apiClient.post(AUTH_ENDPOINTS.logout);
  },
};

export { AUTH_ENDPOINTS };
