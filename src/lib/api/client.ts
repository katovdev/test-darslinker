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

  // Clear auth state from store to prevent redirect loop
  useAppStore.getState().logout();

  // Only redirect if not already on login page
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login";
  }
}

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

function createApiClient(): KyInstance {
  return ky.create({
    prefixUrl: apiConfig.baseUrl,
    timeout: apiConfig.timeout,
    credentials: "include",
    retry: {
      limit: apiConfig.retryAttempts,
      methods: ["get", "post", "put", "delete"],
      statusCodes: [408, 500, 502, 503, 504],
      backoffLimit: apiConfig.retryDelay,
    },
    hooks: {
      afterResponse: [
        async (request, options, response) => {
          if (response.status === 401) {
            const url = request.url;
            if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
              handleUnauthorized();
              return response;
            }

            const refreshed = await tryRefreshToken();
            if (refreshed) {
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
