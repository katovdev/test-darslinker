import { api } from "./client";
import type { User } from "@/context/auth-context";

export const authEndpoints = {
  requestOtp: "auth",
  login: "auth/login",
  refresh: "auth/refresh",
  logout: "auth/logout",
  me: "auth/me",
  updateProfile: "auth/profile",
  avatar: "auth/avatar",
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

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  username?: string | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  data?: User;
  error?: {
    code: string;
    message: string;
  };
}

export interface AvatarResponse {
  success: boolean;
  data?: {
    avatar: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export const authApi = {
  requestOtp: (phone: string) =>
    api.post<RequestOtpResponse>(authEndpoints.requestOtp, { phone }),

  login: (phone: string, code: string) =>
    api.post<AuthResponse>(authEndpoints.login, { phone, code }),

  logout: () => api.post<{ success: boolean }>(authEndpoints.logout),

  refreshToken: () => api.post<RefreshResponse>(authEndpoints.refresh),

  me: () => api.get<MeResponse>(authEndpoints.me),

  updateProfile: (data: UpdateProfileRequest) =>
    api.patch<UpdateProfileResponse>(authEndpoints.updateProfile, data),

  uploadAvatar: async (file: File): Promise<AvatarResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.upload<AvatarResponse>(authEndpoints.avatar, formData);
  },

  deleteAvatar: () => api.delete<{ success: boolean }>(authEndpoints.avatar),
};

export default authApi;
