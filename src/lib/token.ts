const TOKEN_KEY = "auth_token";

export const tokenUtils = {
  normalizeJwtPayload(payload: string): string {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4;

    if (padding === 0) {
      return normalized;
    }

    return normalized.padEnd(normalized.length + (4 - padding), "=");
  },

  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
    } catch {
      console.warn("Failed to access browser storage for token retrieval");
      return null;
    }
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      console.warn("Failed to store token in browser session storage");
    }
  },

  removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      console.warn("Failed to remove token from browser storage");
    }
  },

  hasToken(): boolean {
    const token = this.getToken();
    return !!token?.trim();
  },

  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = tokenUtils.normalizeJwtPayload(parts[1]);
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  isExpired(token?: string | null): boolean {
    const value = token ?? tokenUtils.getToken();
    if (!value) return true;
    const decoded = tokenUtils.decodeToken(value);
    if (!decoded || !decoded.exp) return true;
    const expirationTime = decoded.exp as number;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= expirationTime;
  },

  getTokenExpiration(token?: string | null): number | null {
    const value = token ?? tokenUtils.getToken();
    if (!value) return null;
    const decoded = tokenUtils.decodeToken(value);
    if (!decoded || !decoded.exp) return null;
    return (decoded.exp as number) * 1000;
  },
} as const;
