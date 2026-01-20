// API Client
export { apiClient, api } from "./client";

// Configuration
export { apiConfig, blogEndpoints, cacheConfig } from "./config";

// Auth API
export {
  authApi,
  authEndpoints,
  type RequestOtpRequest,
  type RequestOtpResponse,
  type LoginRequest,
  type AuthResponse,
  type RefreshResponse,
  type MeResponse,
} from "./auth";

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

// Course API
export {
  courseAPI,
  type GlobalCourse,
  type GlobalCourseTeacher,
  type GlobalCoursesResponse,
} from "./courses";
