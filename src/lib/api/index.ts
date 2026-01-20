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
  blogApi,
  blogApi as blogAPI,
  adminBlogApi,
  type Blog,
  type BlogCategory,
  type BlogAuthor,
  type BlogsResponse,
  type BlogResponse,
  type CategoriesResponse,
  type CategoryResponse,
  type LikeResponse,
  type BlogQueryParams,
  type CreateBlogInput,
  type UpdateBlogInput,
  type CreateCategoryInput,
  type UpdateCategoryInput,
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
