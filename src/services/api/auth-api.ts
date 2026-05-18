import { apiClient } from "@/services/api/client";
import type {
  AuthResponse,
  LoginCredentials,
  LoginResponseDTO,
  PasswordChangeConfirmPayload,
  PasswordChangeRequestPayload,
  RegisterCredentials,
  User,
} from "@/types/auth";

const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  passwordRequest: "/api/auth/password/request",
  passwordConfirm: "/api/auth/password/confirm",
} as const;

export const authApi = {
  async login(payload: LoginCredentials) {
    return await apiClient.post<LoginResponseDTO>(AUTH_ENDPOINTS.login, payload);
  },
  register(payload: RegisterCredentials) {
    return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.register, payload);
  },
  getUser(userId: string | number) {
    return apiClient.get<{ user: User } | AuthResponse>(
      `/api/auth/${encodeURIComponent(String(userId))}`
    );
  },
  refresh() {
    return apiClient.post<AuthResponse>(AUTH_ENDPOINTS.refresh);
  },
  logout() {
    return apiClient.post(AUTH_ENDPOINTS.logout);
  },
  passwordRequest(payload: PasswordChangeRequestPayload) {
    return apiClient.post(AUTH_ENDPOINTS.passwordRequest, payload);
  },
  passwordConfirm(payload: PasswordChangeConfirmPayload) {
    return apiClient.post(AUTH_ENDPOINTS.passwordConfirm, payload);
  },
};

export { AUTH_ENDPOINTS };
