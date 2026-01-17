// API Client
export { apiClient, api } from "./client";

// Configuration
export {
  apiConfig,
  blogEndpoints,
  cacheConfig,
  publicEndpoints,
  studentEndpoints,
  teacherEndpoints,
  onboardingEndpoints,
  adminEndpoints,
  courseEndpoints,
  notificationEndpoints,
  landingEndpoints,
} from "./config";

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
  type RequestOtpRequest,
  type RequestOtpResponse,
  type LoginRequest,
  type LoginResponse,
  type RefreshRequest,
  type RefreshResponse,
  type MeResponse,
  type AuthUser,
} from "./auth";

// Course API (legacy)
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

// Landing API (public teacher pages)
export {
  landingAPI,
  type TeacherProfile,
  type LandingSettings,
  type TeacherCourse,
  type PublicLandingResponse,
  type TeacherCoursesResponse,
} from "./landing";

// Public API (teacher subdomain - no auth)
export {
  publicAPI,
  type TenantInfo,
  type PublicTeacher,
  type PublicCourse,
  type PublicModule,
  type PublicLesson,
  type PublicCourseDetail,
  type PublicModuleDetail,
  type PublicLessonDetail,
  type TenantResponse,
  type PublicCoursesResponse,
  type PublicCourseResponse,
  type PublicModuleResponse,
  type PublicLessonResponse,
  type PublicCoursesQueryParams,
} from "./public";

// Student API (requires auth)
export {
  studentAPI,
  type StudentProfile,
  type UpdateProfileRequest,
  type Enrollment,
  type StudentCourse,
  type StudentModule,
  type StudentLesson,
  type StudentLessonDetail,
  type StudentProgress,
  type CourseProgress as StudentCourseProgress,
  type Payment as StudentPayment,
  type SubmitPaymentRequest,
  type ProfileResponse as StudentProfileResponse,
  type EnrollmentsResponse,
  type StudentCourseResponse,
  type StudentLessonResponse,
  type StudentProgressResponse,
  type CourseProgressResponse,
  type PaymentsResponse as StudentPaymentsResponse,
  type PaymentResponse as StudentPaymentResponse,
  type EnrollResponse,
  type CompleteLessonResponse,
} from "./student";

// Teacher API (requires teacher role)
export {
  teacherAPI,
  type TeacherDashboard,
  type TeacherProfile as TeacherOwnProfile,
  type UpdateTeacherProfileRequest,
  type TeacherBranding,
  type UpdateBrandingRequest,
  type TeacherStudent,
  type TeacherCourse as TeacherOwnCourse,
  type TeacherCourseDetail,
  type CreateCourseRequest,
  type UpdateCourseRequest,
  type TeacherModule,
  type CreateModuleRequest,
  type UpdateModuleRequest,
  type TeacherLesson,
  type TeacherLessonDetail,
  type CreateLessonRequest,
  type UpdateLessonRequest,
  type TeacherPayment,
  type TeacherStats,
  type DashboardResponse as TeacherDashboardResponse,
  type TeacherProfileResponse,
  type BrandingResponse,
  type StudentsResponse as TeacherStudentsResponse,
  type StudentResponse as TeacherStudentResponse,
  type CoursesResponse as TeacherCoursesResponse,
  type CourseResponse as TeacherCourseResponse,
  type ModuleResponse as TeacherModuleResponse,
  type LessonResponse as TeacherLessonResponse,
  type PaymentsResponse as TeacherPaymentsResponse,
  type PaymentResponse as TeacherPaymentResponse,
  type StatsResponse as TeacherStatsResponse,
  type ReorderRequest,
} from "./teacher";

// Onboarding API (become a teacher)
export {
  onboardingAPI,
  type OnboardingRequest,
  type OnboardingStatus,
  type OnboardingComplete,
  type OnboardingRequestResponse,
  type OnboardingStatusResponse,
  type OnboardingCompleteResponse,
} from "./onboarding";

// Admin API (requires admin role)
export {
  adminAPI,
  type AdminDashboard,
  type AdminStats,
  type AdminTeacher,
  type TeacherRequest,
  type AdminUser,
  type AdminDashboardResponse,
  type AdminStatsResponse,
  type TeachersResponse as AdminTeachersResponse,
  type TeacherResponse as AdminTeacherResponse,
  type TeacherRequestsResponse,
  type TeacherRequestResponse,
  type UsersResponse as AdminUsersResponse,
  type UserResponse as AdminUserResponse,
} from "./admin";
