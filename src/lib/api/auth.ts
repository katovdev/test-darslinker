/**
 * Auth API
 * Authentication-related API calls for OTP-only authentication via Telegram
 */

import { api } from "./client";
import type { User } from "@/store";

// Auth endpoints for OTP-only authentication
export const authEndpoints = {
  requestOtp: "auth", // POST - request OTP (sends to Telegram)
  login: "auth/login", // POST - verify OTP and login
  refresh: "auth/refresh", // POST - refresh tokens
  logout: "auth/logout", // POST - logout
  me: "auth/me", // GET - get current user
} as const;

// Request types
export interface RequestOtpRequest {
  phone: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

// Response types
export interface RequestOtpResponse {
  success: boolean;
  data?: {
    userId: string;
    message: string;
  };
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
  };
  message?: string;
}

export interface RefreshResponse {
  success: boolean;
  data?: {
    message: string;
  };
  message?: string;
}

export interface MeResponse {
  success: boolean;
  data: User;
}

// Auth API methods
export const authApi = {
  /**
   * Request OTP - sends code via Telegram bot
   */
  requestOtp: (phone: string) =>
    api.post<RequestOtpResponse>(authEndpoints.requestOtp, { phone }),

  /**
   * Verify OTP and login
   */
  login: (phone: string, code: string) =>
    api.post<AuthResponse>(authEndpoints.login, { phone, code }),

  /**
   * Logout current user
   */
  logout: () => api.post<{ success: boolean }>(authEndpoints.logout),

  /**
   * Refresh access token (uses httpOnly cookie, no body needed)
   */
  refreshToken: () =>
    api.post<RefreshResponse>(authEndpoints.refresh),

  /**
   * Get current user
   */
  me: () => api.get<MeResponse>(authEndpoints.me),
};

export default authApi;
