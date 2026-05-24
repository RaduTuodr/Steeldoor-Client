/**
 * Authentication-related type definitions
 */

/**
 * Represents an authenticated user
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  username: string;
  /** User's email address */
  email: string;
  /** Timestamp of account creation */
  createdAt: string;
  /** Optional normalized role when exposed by the backend or token */
  role?: string;
}

/**
 * Credentials for login request
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Data for registration request
 */
export interface RegisterCredentials {
  /** Desired username */
  username: string;
  /** User's email address */
  email: string;
  /** Desired password */
  password: string;
  /** Password confirmation */
  confirmPassword?: string;
}

/**
 * Wire format for POST /api/auth/login — matches server LoginResponseDTO
 */
export interface LoginResponseDTO {
  id: number;
  token: string;
  user: Partial<User> & { id?: string | number; email?: string };
}

/**
 * Response from authentication endpoints (normalized on the client where applicable)
 */
export interface AuthResponse {
  /** Same id as user.id when returned by login; optional for other auth calls */
  id?: number;
  user: User;
  token: string;
  message?: string;
}

/**
 * API error response structure
 */
export interface ApiError {
  /** Error message describing what went wrong */
  message: string;
  /** Optional error code for programmatic handling */
  code?: string;
}

/** POST /password/request — matches server PasswordChangeRequestDTO */
export interface PasswordChangeRequestPayload {
  userId: number | string;
  phoneNumber: string;
}

/** POST /password/confirm — matches server PasswordChangeConfirmDTO */
export interface PasswordChangeConfirmPayload {
  userId: number | string;
  code: string;
  newPassword: string;
}
