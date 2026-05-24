import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { tokenUtils } from "@/lib/token";
import type { ApiError } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getErrorMessage(error: AxiosError<ApiError>) {
  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong while contacting the server."
  );
}

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenUtils.getToken();
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
      if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        // Let the browser provide the multipart boundary for file uploads.
        config.headers.delete("Content-Type");
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
      if (error.response?.status === 401) {
        tokenUtils.removeToken();
      }

      error.message = getErrorMessage(error);
      return Promise.reject(error);
    }
  );

  return client;
}

export const apiClient = createApiClient();
