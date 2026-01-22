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
  teacherPublicAPI,
  type TeacherPublicProfile,
  type TeacherCourse,
  type TeacherStats,
  type TeacherPageSettings,
  type TeacherProfileResponse,
} from "./teachers";

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

export {
  courseContentApi,
  type Module,
  type ModuleDetail,
  type CreateModuleInput,
  type UpdateModuleInput,
  type ReorderModuleItem,
  type Lesson,
  type LessonDetail,
  type CreateLessonInput,
  type UpdateLessonInput,
  type ReorderLessonItem,
  type CourseContentOverview,
} from "./course-content";

export { assignmentsApi, type ListSubmissionsParams } from "./assignments";

export {
  notificationsApi,
  type ListNotificationsParams,
} from "./notifications";

export {
  messagesApi,
  type ListChatsParams,
  type ListMessagesParams,
} from "./messages";

export { achievementsApi } from "./achievements";

// Re-export teacher API additions
export {
  teacherApi,
  type TeacherStats as TeacherDashboardStats,
  type TeacherStudent,
  type TeacherPayment,
  type TeacherEarnings,
  type UpdateProfileDto,
  type QuizAnalytics,
  type StudentAnalytics,
} from "./teacher";
