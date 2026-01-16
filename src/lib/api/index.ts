// API Client
export { apiClient, api } from "./client";

// Configuration
export { apiConfig, blogEndpoints, cacheConfig } from "./config";

// Blog API
export {
  blogAPI,
  type Blog,
  type BlogTag,
  type BlogCategory,
  type BlogSection,
  type BlogsResponse,
  type BlogResponse,
  type Category,
  type CategoriesResponse,
  type BlogQueryParams,
} from "./blog";

// Auth API
export {
  authApi,
  authEndpoints,
  type CheckUserRequest,
  type CheckUserResponse,
  type RegisterRequest,
  type RegisterResponse,
  type LoginRequest,
  type VerifyOtpRequest,
  type ChangePasswordRequest,
  type AuthResponse,
} from "./auth";
