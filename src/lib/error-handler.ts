import { toast } from "sonner";
import { logger } from "./logger";

/**
 * Error types for categorized handling
 */
export const ErrorTypes = {
  NETWORK: "network",
  VALIDATION: "validation",
  AUTHENTICATION: "authentication",
  AUTHORIZATION: "authorization",
  NOT_FOUND: "not_found",
  SERVER: "server",
  CLIENT: "client",
  UNKNOWN: "unknown",
} as const;

export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes];

/**
 * Error severity levels
 */
export const ErrorSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

export type ErrorSeverityLevel =
  (typeof ErrorSeverity)[keyof typeof ErrorSeverity];

interface ErrorInfo {
  message: string;
  stack?: string | null;
  name: string;
  status?: number | null;
  code?: string | null;
}

interface ErrorData extends ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverityLevel;
  context: Record<string, unknown>;
  timestamp: string;
  url: string;
  online: boolean;
}

interface UserFeedback {
  message: string;
  type: "success" | "error" | "warning" | "info";
  showToUser: boolean;
  action?: "retry" | "redirect_login" | "go_back" | "reload" | null;
}

/**
 * Normalize error into consistent format
 */
function normalizeError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      stack: null,
      name: "StringError",
    };
  }

  if (error && typeof error === "object") {
    const obj = error as Record<string, unknown>;
    return {
      message: (obj.message as string) || (obj.error as string) || "Unknown error",
      stack: (obj.stack as string) || null,
      name: (obj.name as string) || "ObjectError",
      status: (obj.status as number) || null,
      code: (obj.code as string) || null,
    };
  }

  return {
    message: "Unknown error occurred",
    stack: null,
    name: "UnknownError",
  };
}

/**
 * Get user-friendly feedback for an error
 */
function getUserFeedback(
  type: ErrorType,
  severity: ErrorSeverityLevel,
  isOnline: boolean
): UserFeedback {
  switch (type) {
    case ErrorTypes.NETWORK:
      if (!isOnline) {
        return {
          message: "You are offline. Please check your connection.",
          type: "warning",
          showToUser: true,
          action: "retry",
        };
      }
      return {
        message: "Network error. Please check your connection.",
        type: "error",
        showToUser: true,
        action: "retry",
      };

    case ErrorTypes.AUTHENTICATION:
      return {
        message: "Please log in to continue.",
        type: "error",
        showToUser: true,
        action: "redirect_login",
      };

    case ErrorTypes.AUTHORIZATION:
      return {
        message: "You don't have permission to access this.",
        type: "warning",
        showToUser: true,
        action: "go_back",
      };

    case ErrorTypes.VALIDATION:
      return {
        message: "Please check your input.",
        type: "warning",
        showToUser: true,
        action: null,
      };

    case ErrorTypes.NOT_FOUND:
      return {
        message: "The requested resource was not found.",
        type: "warning",
        showToUser: true,
        action: "go_back",
      };

    case ErrorTypes.SERVER:
      return {
        message:
          severity === ErrorSeverity.CRITICAL
            ? "Server error. Please try again later."
            : "Temporary error. Please try again.",
        type: "error",
        showToUser: true,
        action: "retry",
      };

    default:
      return {
        message: "Something went wrong. Please try again.",
        type: "error",
        showToUser: severity !== ErrorSeverity.LOW,
        action: severity === ErrorSeverity.CRITICAL ? "reload" : null,
      };
  }
}

/**
 * Main error handling function
 */
export function handleError(
  error: unknown,
  type: ErrorType = ErrorTypes.UNKNOWN,
  severity: ErrorSeverityLevel = ErrorSeverity.MEDIUM,
  context: Record<string, unknown> = {}
): { handled: boolean; userMessage: string; retry: boolean } {
  try {
    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const errorInfo = normalizeError(error);

    const errorData: ErrorData = {
      ...errorInfo,
      type,
      severity,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      online: isOnline,
    };

    // Log error
    logger.error("Error handled:", errorData);

    // Get user feedback
    const feedback = getUserFeedback(type, severity, isOnline);

    // Show toast notification
    if (feedback.showToUser) {
      switch (feedback.type) {
        case "error":
          toast.error(feedback.message);
          break;
        case "warning":
          toast.warning(feedback.message);
          break;
        case "info":
          toast.info(feedback.message);
          break;
        default:
          toast(feedback.message);
      }
    }

    return {
      handled: true,
      userMessage: feedback.message,
      retry: feedback.action === "retry",
    };
  } catch (handlingError) {
    logger.error("Error in error handler:", handlingError);
    toast.error("Something went wrong. Please try again.");
    return { handled: false, userMessage: "Error", retry: false };
  }
}

/**
 * Wrap async function with error handling
 */
export function wrapAsync<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorType: ErrorType = ErrorTypes.UNKNOWN,
  context: Record<string, unknown> = {}
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, errorType, ErrorSeverity.MEDIUM, context);
      throw error;
    }
  };
}

/**
 * Get error type from HTTP status code
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status === 401) return ErrorTypes.AUTHENTICATION;
  if (status === 403) return ErrorTypes.AUTHORIZATION;
  if (status === 404) return ErrorTypes.NOT_FOUND;
  if (status === 422) return ErrorTypes.VALIDATION;
  if (status >= 500) return ErrorTypes.SERVER;
  if (status >= 400) return ErrorTypes.CLIENT;
  return ErrorTypes.UNKNOWN;
}
