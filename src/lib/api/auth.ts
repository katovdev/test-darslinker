/**
 * Auth API
 * Authentication-related API calls for OTP-only authentication via Telegram
 */

import { api } from "./client";
import type { User } from "@/context/auth-context";

export const authEndpoints = {
  requestOtp: "auth",
  login: "auth/login",
  refresh: "auth/refresh",
  logout: "auth/logout",
  me: "auth/me",
} as const;

export interface RequestOtpRequest {
  phone: string;
}

export interface LoginRequest {
  phone: string;
  code: string;
}

export interface RequestOtpResponse {
  success: boolean;
  data?: {
    message: string;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
  };
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

export const authApi = {
  requestOtp: (phone: string) =>
    api.post<RequestOtpResponse>(authEndpoints.requestOtp, { phone }),

  login: (phone: string, code: string) =>
    api.post<AuthResponse>(authEndpoints.login, { phone, code }),

  logout: () => api.post<{ success: boolean }>(authEndpoints.logout),

  refreshToken: () => api.post<RefreshResponse>(authEndpoints.refresh),

  me: () => api.get<MeResponse>(authEndpoints.me),
};

export default authApi;
