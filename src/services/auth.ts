/**
 * Auth Service
 * Handles OTP-only authentication logic, validation, and phone formatting
 * Registration happens via Telegram bot - this only handles login
 */

import { authApi, type AuthResponse } from "@/lib/api";
import { useAppStore } from "@/store";

// Validation patterns
const PHONE_DIGITS_ONLY = /[^0-9]/g;

// Single Telegram bot for OTP (both login and registration handled by same bot)
export const TELEGRAM_BOT = "DarslinkerBot";

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
  const { setUser, setAuthToken, setRefreshToken } = useAppStore.getState();
  setAuthToken(response.accessToken);
  if (response.refreshToken) {
    setRefreshToken(response.refreshToken);
  }
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
 * Request OTP - sends code via Telegram bot
 */
export async function requestOtp(phone: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  return authApi.requestOtp(fullPhone);
}

/**
 * Verify OTP and login
 */
export async function verifyOtp(phone: string, code: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  const response = await authApi.login(fullPhone, code);

  if (response.success && response.accessToken && response.user) {
    saveAuthData(response);
  }

  return response;
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

/**
 * Get current user from API
 */
export async function getCurrentUser() {
  return authApi.me();
}

/**
 * Refresh access token
 */
export async function refreshToken() {
  const token = localStorage.getItem("refresh_token");
  if (!token) {
    throw new Error("No refresh token available");
  }

  const response = await authApi.refreshToken(token);

  if (response.success && response.accessToken) {
    localStorage.setItem("auth_token", response.accessToken);
    const { setAuthToken } = useAppStore.getState();
    setAuthToken(response.accessToken);

    if (response.refreshToken) {
      localStorage.setItem("refresh_token", response.refreshToken);
      const { setRefreshToken } = useAppStore.getState();
      setRefreshToken(response.refreshToken);
    }
  }

  return response;
}

/**
 * Open Telegram bot for OTP or registration
 */
export function openTelegramBot() {
  window.open(`https://t.me/${TELEGRAM_BOT}`, "_blank");
}

export default {
  formatPhoneNumber,
  getPhoneDigits,
  formatFullPhoneNumber,
  validators,
  saveAuthData,
  clearAuthData,
  requestOtp,
  verifyOtp,
  logout,
  getCurrentUser,
  refreshToken,
  openTelegramBot,
  TELEGRAM_BOT,
};
