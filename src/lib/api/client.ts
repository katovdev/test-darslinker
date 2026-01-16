import ky, { type KyInstance, type Options } from "ky";
import { apiConfig } from "./config";

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Handle 401 unauthorized response
 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  window.location.href = "/login";
}

/**
 * Create configured ky instance
 */
function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    retry: {
      limit: apiConfig.retryAttempts,
      methods: ["get", "post", "put", "delete"],
      statusCodes: [408, 500, 502, 503, 504],
      backoffLimit: apiConfig.retryDelay,
    },
    hooks: {
      beforeRequest: [
        (request) => {
          // Add auth token if available
          const token = getAuthToken();
          if (token) {
            request.headers.set("Authorization", `Bearer ${token}`);
          }
        },
      ],
      afterResponse: [
        async (_request, _options, response) => {
          // Handle 401 unauthorized
          if (response.status === 401) {
            handleUnauthorized();
          }
          return response;
        },
      ],
    },
  });
}

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Type-safe API methods
 */
export const api = {
  get: <T>(url: string, options?: Options) =>
    apiClient.get(url, options).json<T>(),

  post: <T>(url: string, data?: unknown, options?: Options) =>
    apiClient.post(url, { json: data, ...options }).json<T>(),

  put: <T>(url: string, data?: unknown, options?: Options) =>
    apiClient.put(url, { json: data, ...options }).json<T>(),

  patch: <T>(url: string, data?: unknown, options?: Options) =>
    apiClient.patch(url, { json: data, ...options }).json<T>(),

  delete: <T>(url: string, options?: Options) =>
    apiClient.delete(url, options).json<T>(),
};

export default apiClient;
