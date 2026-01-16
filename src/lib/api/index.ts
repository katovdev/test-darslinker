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

// Course API
export {
  courseAPI,
  type Teacher,
  type Lesson,
  type Module,
  type Course,
  type CourseProgress,
  type EnrolledCourse,
  type Quiz,
  type QuizQuestion,
  type QuizAttempt,
  type TeacherLanding,
  type CoursesResponse,
  type CourseResponse,
  type EnrolledCoursesResponse,
  type ProgressResponse,
  type LessonResponse,
  type QuizResponse,
  type QuizAttemptsResponse,
  type QuizSubmitResponse,
  type CourseQueryParams,
} from "./courses";

// Notification API
export {
  notificationAPI,
  type Notification,
  type NotificationType,
  type NotificationsResponse,
  type NotificationResponse,
  type UnreadCountResponse,
  type NotificationQueryParams,
} from "./notifications";

// Endpoint configurations
export { courseEndpoints, notificationEndpoints } from "./config";
