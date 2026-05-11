/**
 * JWT Token management utilities
 */

const TOKEN_KEY = "auth_token";

/**
 * Token storage and retrieval utilities
 */
export const tokenUtils = {
  /**
   * Retrieves the JWT token from localStorage
   * @returns Token string or null if not found
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      console.warn("Failed to access localStorage for token retrieval");
      return null;
    }
  },

  /**
   * Stores the JWT token in localStorage
   * @param token - Token to store
   */
  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      console.warn("Failed to store token in localStorage");
    }
  },

  /**
   * Removes the JWT token from localStorage
   */
  removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      console.warn("Failed to remove token from localStorage");
    }
  },

  /**
   * Checks if a valid token exists
   * @returns True if token exists and is non-empty
   */
  hasToken(): boolean {
    const token = this.getToken();
    return !!token?.trim();
  },

  /**
   * Decodes a JWT token payload (without verification)
   * @param token - JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): Record<string, unknown> | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const payload = parts[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  /**
   * Checks if a token is expired
   * @returns True if token is expired or exp claim is missing
   */
  isExpired(token?: string | null): boolean {
    const value = token ?? tokenUtils.getToken();
    if (!value) return true;
    const decoded = tokenUtils.decodeToken(value);
    if (!decoded || !decoded.exp) return true;
    const expirationTime = decoded.exp as number;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= expirationTime;
  },

  /**
   * Gets the token expiration time
   * @returns Expiration timestamp in milliseconds or null
   */
  getTokenExpiration(token?: string | null): number | null {
    const value = token ?? tokenUtils.getToken();
    if (!value) return null;
    const decoded = tokenUtils.decodeToken(value);
    if (!decoded || !decoded.exp) return null;
    return (decoded.exp as number) * 1000;
  },
} as const;
