import { authApi } from "@/services/api/auth-api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "@/types/auth";

function toApiUserId(id: string): number | string {
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
}

function normalizeUser(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Partial<User> & { user?: Partial<User> };
  const source = candidate.user && typeof candidate.user === "object" ? candidate.user : candidate;

  if (!source.id || !source.email) {
    return null;
  }

  return {
    id: String(source.id),
    email: String(source.email),
    username: String(source.username ?? source.email),
    createdAt: String(source.createdAt ?? ""),
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

  async getCurrentUser(): Promise<User> {
    const data = (await authApi.me()).data;
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
