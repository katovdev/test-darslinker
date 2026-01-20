export { apiClient, api } from "./client";
export { apiConfig, blogEndpoints, cacheConfig } from "./config";

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

export {
  courseAPI,
  type GlobalCourse,
  type GlobalCourseTeacher,
  type GlobalCoursesResponse,
} from "./courses";

export {
  adminApi,
  type AdminStats,
  type AdminUser,
  type AdminUserDetail,
  type AdminCourse,
  type AdminCourseDetail,
  type AdminPayment,
  type AdminEarning,
  type ListUsersParams as AdminListUsersParams,
  type ListCoursesParams as AdminListCoursesParams,
  type ListPaymentsParams,
  type ListEarningsParams,
  type UpdateUserInput as AdminUpdateUserInput,
  type UpdateCourseStatusInput as AdminUpdateCourseStatusInput,
  type UpdatePaymentInput,
} from "./admin";

export {
  moderatorApi,
  type ModeratorStats,
  type ModeratorUser,
  type ModeratorUserDetail,
  type ModeratorCourse,
  type ModeratorCourseDetail,
  type ListUsersParams as ModeratorListUsersParams,
  type ListCoursesParams as ModeratorListCoursesParams,
  type UpdateUserStatusInput,
  type UpdateCourseStatusInput as ModeratorUpdateCourseStatusInput,
} from "./moderator";
