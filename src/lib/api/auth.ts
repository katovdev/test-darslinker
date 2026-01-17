/**
 * Auth API
 * Authentication-related API calls for OTP-only authentication via Telegram
 */

import { api } from "./client";
import type { User } from "@/store";

// Auth endpoints for OTP-only authentication
export const authEndpoints = {
  requestOtp: "/auth",           // POST - request OTP (sends to Telegram)
  login: "/auth/login",          // POST - verify OTP and login
  refresh: "/auth/refresh",      // POST - refresh tokens
  logout: "/auth/logout",        // POST - logout
  me: "/auth/me",                // GET - get current user
} as const;

// Request types
export interface RequestOtpRequest {
  phone: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

// Response types
export interface RequestOtpResponse {
  success: boolean;
  message?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

export interface MeResponse {
  user: User;
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
   * Refresh access token
   */
  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>(authEndpoints.refresh, { refreshToken }),

  /**
   * Get current user
   */
  me: () => api.get<MeResponse>(authEndpoints.me),
};

export default authApi;
