import { authApi } from "@/services/api/auth-api";
import { tokenUtils } from "@/lib/token";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

function normalizeRole(candidate: unknown): string | undefined {
  if (Array.isArray(candidate)) {
    for (const value of candidate) {
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
      if (value && typeof value === "object") {
        const authority = (value as { authority?: unknown }).authority;
        if (typeof authority === "string" && authority.trim()) {
          return authority.trim();
        }
      }
    }

    return undefined;
  }

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  if (candidate && typeof candidate === "object") {
    const authority = (candidate as { authority?: unknown }).authority;
    if (typeof authority === "string" && authority.trim()) {
      return authority.trim();
    }
  }

  return undefined;
}

function extractRoleFromToken(token?: string | null): string | undefined {
  const value = token ?? tokenUtils.getToken();
  if (!value) {
    return undefined;
  }

  const decoded = tokenUtils.decodeToken(value);
  if (!decoded) {
    return undefined;
  }

  const candidates = [
    decoded.role,
    decoded.roles,
    decoded.authorities,
    decoded.authority,
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role) {
      return role;
    }
  }

  return undefined;
}

function toApiUserId(id: string): number | string {
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function extractUserIdFromToken(token?: string | null): string | null {
  const value = token ?? tokenUtils.getToken();
  if (!value) {
    return null;
  }

  const decoded = tokenUtils.decodeToken(value);
  if (!decoded) {
    return null;
  }

  const candidates = [decoded.userId, decoded.id, decoded.sub];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }

  return null;
}

function normalizeUser(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<User> & {
    user?: Partial<User>;
    role?: unknown;
    roles?: unknown;
    authorities?: unknown;
  };
  const source = candidate.user && typeof candidate.user === "object" ? candidate.user : candidate;

  if (!source.id || !source.email) {
    return null;
  }

  const role =
    normalizeRole(
    (source as { roles?: unknown; authorities?: unknown; role?: unknown }).roles ??
      (source as { authorities?: unknown }).authorities ??
      (source as { role?: unknown }).role ??
      candidate.roles ??
      candidate.authorities ??
      candidate.role
    ) ?? extractRoleFromToken();

  return {
    id: String(source.id),
    email: String(source.email),
    username: String(source.username ?? source.email),
    createdAt: String(source.createdAt ?? ""),
    role,
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = (await authApi.login(credentials)).data;
    const user = normalizeUser(data);

    if (!user) {
      throw new Error("Login succeeded, but the server did not return user data.");
    }

    return {
      ...data,
      user,
    };
  }

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const registerData = {
      username: data.username,
      email: data.email,
      password: data.password
    };

    return (await authApi.register(registerData)).data;
  }

  async logout(): Promise<void> {
    await authApi.logout();
  }

  async getCurrentUser(userId?: string): Promise<User> {
    const resolvedUserId = userId?.trim() || extractUserIdFromToken();

    if (!resolvedUserId) {
      throw new Error("Could not determine the current user id.");
    }

    const data = (await authApi.getUser(toApiUserId(resolvedUserId))).data;
    const user = normalizeUser(data);

    if (!user) {
      throw new Error("The server did not return the current user.");
    }

    return user;
  }

  async refreshToken(): Promise<AuthResponse> {
    return (await authApi.refresh()).data;
  }

  async requestPasswordChange(userId: string, phoneNumber: string): Promise<void> {
    await authApi.passwordRequest({
      userId: toApiUserId(userId),
      phoneNumber: phoneNumber.trim(),
    });
  }

  async confirmPasswordChange(
    userId: string,
    code: string,
    newPassword: string
  ): Promise<void> {
    await authApi.passwordConfirm({
      userId: toApiUserId(userId),
      code: code.trim(),
      newPassword,
    });
  }
}

export const authService = new AuthService();
export { AuthService };
