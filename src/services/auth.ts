/**
 * Auth Service
 * Handles authentication logic, validation, and phone formatting
 */

import { authApi, type AuthResponse } from "@/lib/api";
import { useAppStore } from "@/store";

// Validation patterns
const NAME_PATTERN = /^[a-zA-Z\u0400-\u04FF\u00C0-\u017F]+$/;
const PHONE_DIGITS_ONLY = /[^0-9]/g;

// Telegram bots for OTP
export const TELEGRAM_BOTS = {
  login: "Darslinker_sbot",
  register: "Darslinker_cbot",
} as const;

/**
 * Format phone number as XX XXX XX XX
 */
export function formatPhoneNumber(value: string): string {
  const digits = value.replace(PHONE_DIGITS_ONLY, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7)
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

/**
 * Get raw phone digits (9 digits without formatting)
 */
export function getPhoneDigits(value: string): string {
  return value.replace(PHONE_DIGITS_ONLY, "").slice(0, 9);
}

/**
 * Format full phone number with country code
 */
export function formatFullPhoneNumber(digits: string): string {
  return `+998${digits}`;
}

/**
 * Validation functions
 */
export const validators = {
  phone: (value: string): string | null => {
    const digits = getPhoneDigits(value);
    if (!digits) return "phoneRequired";
    if (digits.length !== 9) return "phoneInvalid";
    return null;
  },

  password: (value: string): string | null => {
    if (!value) return "passwordRequired";
    if (value.length < 6) return "passwordMinLength";
    if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
      return "passwordRequirements";
    }
    return null;
  },

  passwordSimple: (value: string): string | null => {
    if (!value) return "passwordRequired";
    return null;
  },

  confirmPassword: (
    password: string,
    confirmPassword: string
  ): string | null => {
    if (!confirmPassword) return "passwordRequired";
    if (password !== confirmPassword) return "passwordMismatch";
    return null;
  },

  firstName: (value: string): string | null => {
    if (!value.trim()) return "firstNameRequired";
    if (value.trim().length < 3) return "firstNameMinLength";
    if (!NAME_PATTERN.test(value.trim())) return "firstNameInvalid";
    return null;
  },

  lastName: (value: string): string | null => {
    if (!value.trim()) return "lastNameRequired";
    if (value.trim().length < 3) return "lastNameMinLength";
    if (!NAME_PATTERN.test(value.trim())) return "lastNameInvalid";
    return null;
  },

  otp: (value: string): string | null => {
    if (!value) return "otpRequired";
    if (!/^\d{6}$/.test(value)) return "otpInvalid";
    return null;
  },
};

/**
 * Save auth data to storage and store
 */
export function saveAuthData(response: AuthResponse): void {
  if (!response.accessToken || !response.user) return;

  // Save to localStorage
  localStorage.setItem("auth_token", response.accessToken);
  if (response.refreshToken) {
    localStorage.setItem("refresh_token", response.refreshToken);
  }

  // Update Zustand store
  const { setUser, setAuthToken } = useAppStore.getState();
  setAuthToken(response.accessToken);
  setUser(response.user);
}

/**
 * Clear auth data from storage and store
 */
export function clearAuthData(): void {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");

  const { logout } = useAppStore.getState();
  logout();
}

/**
 * Check if user exists by phone number
 */
export async function checkUser(phone: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  return authApi.checkUser(fullPhone);
}

/**
 * Login with phone and password
 */
export async function login(phone: string, password: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  const response = await authApi.login(fullPhone, password);

  if (response.success && response.accessToken && response.user) {
    saveAuthData(response);
  }

  return response;
}

/**
 * Register new user
 */
export async function register(data: {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role?: "student" | "teacher";
}) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(data.phone));
  return authApi.register({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    phone: fullPhone,
    password: data.password,
    role: data.role || "teacher",
  });
}

/**
 * Verify OTP during registration
 */
export async function verifyOtp(phone: string, otp: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  const response = await authApi.verifyRegistrationOtp(fullPhone, otp);

  if (response.success && response.accessToken && response.user) {
    saveAuthData(response);
  }

  return response;
}

/**
 * Resend OTP
 */
export async function resendOtp(phone: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  return authApi.resendRegistrationOtp(fullPhone);
}

/**
 * Logout current user
 */
export async function logout() {
  try {
    await authApi.logout();
  } catch {
    // Ignore errors on logout
  } finally {
    clearAuthData();
  }
}

export default {
  formatPhoneNumber,
  getPhoneDigits,
  formatFullPhoneNumber,
  validators,
  saveAuthData,
  clearAuthData,
  checkUser,
  login,
  register,
  verifyOtp,
  resendOtp,
  logout,
  TELEGRAM_BOTS,
};
