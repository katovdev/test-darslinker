/**
 * Production-ready logger utility
 * Automatically disables console logs in production environment
 */

const isDevelopment = process.env.NODE_ENV === "development";

type LogLevel = "log" | "error" | "warn" | "info" | "debug";

interface ErrorData {
  level: LogLevel;
  message: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private maxStoredErrors = 50;

  log(...args: unknown[]): void {
    if (isDevelopment) {
      console.log(...args);
    }
  }

  error(...args: unknown[]): void {
    if (isDevelopment) {
      console.error(...args);
    } else {
      this.sendToMonitoring("error", args);
    }
  }

  warn(...args: unknown[]): void {
    if (isDevelopment) {
      console.warn(...args);
    } else {
      this.sendToMonitoring("warn", args);
    }
  }

  info(...args: unknown[]): void {
    if (isDevelopment) {
      console.info(...args);
    }
  }

  debug(...args: unknown[]): void {
    if (isDevelopment) {
      console.debug(...args);
    }
  }

  /**
   * Send critical errors to monitoring service in production
   * Currently stores in sessionStorage, can be integrated with Sentry/LogRocket
   */
  private sendToMonitoring(level: LogLevel, args: unknown[]): void {
    if (typeof window === "undefined") return;

    try {
      const errorData: ErrorData = {
        level,
        message: args.map((arg) => String(arg)).join(" "),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const errors: ErrorData[] = JSON.parse(
        sessionStorage.getItem("app_errors") || "[]"
      );
      errors.push(errorData);

      // Keep only last N errors to prevent memory issues
      if (errors.length > this.maxStoredErrors) {
        errors.splice(0, errors.length - this.maxStoredErrors);
      }

      sessionStorage.setItem("app_errors", JSON.stringify(errors));
    } catch {
      // Fail silently in production
    }
  }

  /**
   * Retrieve stored errors for debugging
   */
  getStoredErrors(): ErrorData[] {
    if (typeof window === "undefined") return [];
    return JSON.parse(sessionStorage.getItem("app_errors") || "[]");
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("app_errors");
  }
}

export const logger = new Logger();
