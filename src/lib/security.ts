/**
 * Security utilities for input validation and CSRF protection
 * Note: React handles XSS prevention by default through JSX escaping
 */

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  error?: string;
}

/**
 * Validate and sanitize user input
 */
export function validateInput(
  input: string,
  type: "email" | "phone" | "url" | "text" = "text"
): ValidationResult {
  if (typeof input !== "string") {
    return { isValid: false, sanitized: "", error: "Invalid input type" };
  }

  // Basic sanitization - remove null bytes and control characters
  let sanitized = input.replace(/[\x00-\x08\x0E-\x1F\x7F]/g, "");

  switch (type) {
    case "email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const trimmed = sanitized.toLowerCase().trim();
      return {
        isValid: emailRegex.test(trimmed),
        sanitized: trimmed,
        error: emailRegex.test(trimmed) ? undefined : "Invalid email format",
      };
    }

    case "phone": {
      // Remove all non-digits
      const phoneDigits = sanitized.replace(/\D/g, "");
      const isValidPhone = phoneDigits.length >= 9 && phoneDigits.length <= 15;
      return {
        isValid: isValidPhone,
        sanitized: phoneDigits,
        error: isValidPhone ? undefined : "Invalid phone number",
      };
    }

    case "url": {
      try {
        const url = new URL(sanitized);
        const isHttp = url.protocol === "https:" || url.protocol === "http:";
        return {
          isValid: isHttp,
          sanitized: url.toString(),
          error: isHttp ? undefined : "Invalid URL",
        };
      } catch {
        return { isValid: false, sanitized: "", error: "Invalid URL format" };
      }
    }

    case "text":
    default: {
      sanitized = sanitized.trim();
      const isValid = sanitized.length > 0 && sanitized.length <= 1000;
      return {
        isValid,
        sanitized,
        error: isValid
          ? undefined
          : "Text must be between 1 and 1000 characters",
      };
    }
  }
}

/**
 * Generate CSRF token for form submissions
 */
export function generateCSRFToken(): string {
  if (typeof window === "undefined") return "";

  const array = new Uint32Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (dec) => dec.toString(16)).join("");
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  if (typeof window === "undefined") return false;

  const storedToken = sessionStorage.getItem("csrf_token");
  return token === storedToken;
}

/**
 * Set CSRF token for session
 */
export function setCSRFToken(token: string): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("csrf_token", token);
}

/**
 * Get or create CSRF token
 */
export function getOrCreateCSRFToken(): string {
  if (typeof window === "undefined") return "";

  let token = sessionStorage.getItem("csrf_token");
  if (!token) {
    token = generateCSRFToken();
    setCSRFToken(token);
  }
  return token;
}
