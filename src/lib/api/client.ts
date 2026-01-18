import ky, { type KyInstance, type Options } from "ky";
import { apiConfig } from "./config";

/**
 * Handle 401 unauthorized response
 */
function handleUnauthorized(): void {
  if (typeof window === "undefined") return;
  // Clear any local auth state
  window.location.href = "/login";
}

/**
 * Try to refresh token on 401
 */
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await ky.post(`${apiConfig.baseUrl}/auth/refresh`, {
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Create configured ky instance
 */
function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    credentials: "include", // Send cookies with every request
    retry: {
      limit: apiConfig.retryAttempts,
      methods: ["get", "post", "put", "delete"],
      statusCodes: [408, 500, 502, 503, 504],
      backoffLimit: apiConfig.retryDelay,
    },
    hooks: {
      afterResponse: [
        async (request, options, response) => {
          // Handle 401 unauthorized - try to refresh token
          if (response.status === 401) {
            // Don't try refresh for auth endpoints themselves
            const url = request.url;
            if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
              handleUnauthorized();
              return response;
            }

            // Try to refresh token
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              // Retry the original request
              return ky(request, options);
            }

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
