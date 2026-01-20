import { authApi, type AuthResponse } from "@/lib/api";
import { setTokens, clearTokens } from "@/lib/cookies";

const PHONE_DIGITS_ONLY = /[^0-9]/g;

export const TELEGRAM_BOT = "DarslinkerBot";

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(PHONE_DIGITS_ONLY, "").slice(0, 9);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 7)
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
}

export function getPhoneDigits(value: string): string {
  return value.replace(PHONE_DIGITS_ONLY, "").slice(0, 9);
}

export function formatFullPhoneNumber(digits: string): string {
  return `+998${digits}`;
}

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

export function saveAuthData(response: AuthResponse): void {
  if (!response.data) return;

  const { accessToken, refreshToken } = response.data;
  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
  }
}

export function clearAuthData(): void {
  clearTokens();
}

export async function requestOtp(phone: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  return authApi.requestOtp(fullPhone);
}

export async function verifyOtp(phone: string, code: string) {
  const fullPhone = formatFullPhoneNumber(getPhoneDigits(phone));
  const response = await authApi.login(fullPhone, code);

  if (response.success && response.data) {
    saveAuthData(response);
  }

  return response;
}

export async function logout() {
  try {
    await authApi.logout();
  } catch {
    // Ignore errors on logout
  } finally {
    clearAuthData();
  }
}

export async function getCurrentUser() {
  return authApi.me();
}

export async function refreshToken() {
  return authApi.refreshToken();
}

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
