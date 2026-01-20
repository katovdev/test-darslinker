import ky, { type KyInstance, type Options, HTTPError } from "ky";
import { apiConfig } from "./config";
import { useAppStore } from "@/store";

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

async function parseErrorResponse(error: HTTPError): Promise<ApiError> {
  try {
    const body = (await error.response.json()) as {
      error?: { code?: string; message?: string };
      message?: string;
    };
    return {
      success: false,
      error: {
        code: body.error?.code || "UNKNOWN_ERROR",
        message: body.error?.message || body.message || "An error occurred",
      },
    };
  } catch {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "An error occurred",
      },
    };
  }
}

function handleUnauthorized(): void {
  if (typeof window === "undefined") return;

  // Clear auth state from store
  useAppStore.getState().logout();

  // Only redirect if not already on login page
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

async function tryRefreshToken(): Promise<boolean> {
  const { refreshToken, setAccessToken } = useAppStore.getState();

  if (!refreshToken) return false;

  try {
    const response = await ky.post(`${apiConfig.baseUrl}/auth/refresh`, {
      json: { refreshToken },
    });

    if (response.ok) {
      const data = (await response.json()) as {
        success: boolean;
        data?: { accessToken: string };
      };
      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

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
          // Add Authorization header with access token from store
          const { accessToken } = useAppStore.getState();
          if (accessToken) {
            request.headers.set("Authorization", `Bearer ${accessToken}`);
          }
        },
      ],
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const url = request.url;
            // Don't try to refresh on auth endpoints
            if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
              handleUnauthorized();
              return response;
            }

            // Try to refresh token (up to 3 times per TODO.md)
            let refreshed = false;
            for (let i = 0; i < 3; i++) {
              refreshed = await tryRefreshToken();
              if (refreshed) break;
            }

            if (refreshed) {
              // Retry the original request with new token
              const { accessToken } = useAppStore.getState();
              const newRequest = new Request(request, {
                headers: new Headers(request.headers),
              });
              newRequest.headers.set("Authorization", `Bearer ${accessToken}`);
              return ky(newRequest, options);
            }

            handleUnauthorized();
          }
          return response;
        },
      ],
    },
  });
}

export const apiClient = createApiClient();

export const api = {
  get: async <T>(url: string, options?: Options): Promise<T> => {
    try {
      return await apiClient.get(url, options).json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        return parseErrorResponse(error) as T;
      }
      throw error;
    }
  },

  post: async <T>(
    url: string,
    data?: unknown,
    options?: Options
  ): Promise<T> => {
    try {
      return await apiClient.post(url, { json: data, ...options }).json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        return parseErrorResponse(error) as T;
      }
      throw error;
    }
  },

  put: async <T>(
    url: string,
    data?: unknown,
    options?: Options
  ): Promise<T> => {
    try {
      return await apiClient.put(url, { json: data, ...options }).json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        return parseErrorResponse(error) as T;
      }
      throw error;
    }
  },

  patch: async <T>(
    url: string,
    data?: unknown,
    options?: Options
  ): Promise<T> => {
    try {
      return await apiClient.patch(url, { json: data, ...options }).json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        return parseErrorResponse(error) as T;
      }
      throw error;
    }
  },

  delete: async <T>(url: string, options?: Options): Promise<T> => {
    try {
      return await apiClient.delete(url, options).json<T>();
    } catch (error) {
      if (error instanceof HTTPError) {
        return parseErrorResponse(error) as T;
      }
      throw error;
    }
  },
};

export default apiClient;
