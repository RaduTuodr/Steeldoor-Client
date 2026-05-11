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
 * Response from authentication endpoints
 */
export interface AuthResponse {
  /** Authenticated user data */
  user: User;
  /** JWT authentication token */
  token: string;
  /** Optional success message */
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