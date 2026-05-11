/**
 * Generic API response type definitions
 */

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Optional success message */
  message?: string;
  /** Indicates if the request was successful */
  success: boolean;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  /** Array of items for the current page */
  data: T[];
  /** Total number of items across all pages */
  total: number;
  /** Current page number (1-indexed) */
  page: number;
  /** Number of items per page */
  pageSize: number;
}

/**
 * Request configuration options
 */
export interface RequestConfig {
  /** Whether to include authentication token */
  authenticated?: boolean;
  /** Custom headers to merge with defaults */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';