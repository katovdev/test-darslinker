/**
 * Auth API
 * Authentication-related API calls
 */

import { api } from "./client";
import type { User } from "@/store";

// Auth endpoints
export const authEndpoints = {
  checkUser: "/auth/check-user",
  register: "/auth/register",
  verifyRegistrationOtp: "/auth/verify-registration-otp",
  resendRegistrationOtp: "/auth/resend-registration-otp",
  login: "/auth/login",
  logout: "/auth/logout",
  changePassword: "/auth/change-password",
  refreshToken: "/auth/refresh-token",
} as const;

// Request types
export interface CheckUserRequest {
  identifier: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  role: "student" | "teacher";
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response types
export interface CheckUserResponse {
  exists: boolean;
  next?: "login" | "verify" | "register";
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export interface AuthResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

// Auth API methods
export const authApi = {
  /**
   * Check if user exists by phone/email
   */
  checkUser: (identifier: string) =>
    api.post<CheckUserResponse>(authEndpoints.checkUser, { identifier }),

  /**
   * Register new user
   */
  register: (data: RegisterRequest) =>
    api.post<RegisterResponse>(authEndpoints.register, data),

  /**
   * Verify OTP during registration
   */
  verifyRegistrationOtp: (identifier: string, otp: string) =>
    api.post<AuthResponse>(authEndpoints.verifyRegistrationOtp, {
      identifier,
      otp,
    }),

  /**
   * Resend OTP for registration
   */
  resendRegistrationOtp: (identifier: string) =>
    api.post<{ success: boolean; message?: string }>(
      authEndpoints.resendRegistrationOtp,
      { identifier }
    ),

  /**
   * Login with password
   */
  login: (identifier: string, password: string) =>
    api.post<AuthResponse>(authEndpoints.login, { identifier, password }),

  /**
   * Logout current user
   */
  logout: () => api.post<{ success: boolean }>(authEndpoints.logout),

  /**
   * Change password
   */
  changePassword: (data: ChangePasswordRequest) =>
    api.patch<{ success: boolean; message?: string }>(
      authEndpoints.changePassword,
      data
    ),

  /**
   * Refresh access token
   */
  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>(authEndpoints.refreshToken, { refreshToken }),
};

export default authApi;
