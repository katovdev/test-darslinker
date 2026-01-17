/**
 * API Configuration
 * Centralized configuration for API endpoints and settings
 */

const isDevelopment = process.env.NODE_ENV === "development";

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api",
  timeout: isDevelopment ? 10000 : 15000,
  retryAttempts: isDevelopment ? 3 : 2,
  retryDelay: isDevelopment ? 1000 : 2000,
} as const;

// Auth API endpoints (OTP-only)
export const authEndpoints = {
  requestOtp: "auth",
  login: "auth/login",
  refresh: "auth/refresh",
  logout: "auth/logout",
  me: "auth/me",
} as const;

// Public endpoints (on teacher subdomain - no auth required)
export const publicEndpoints = {
  getTenant: "public/tenant",
  getCourses: "public/courses",
  getCourseBySlug: (slug: string) => `public/courses/${slug}`,
  getModuleBySlug: (courseSlug: string, moduleSlug: string) =>
    `public/courses/${courseSlug}/modules/${moduleSlug}`,
  getLessonBySlug: (
    courseSlug: string,
    moduleSlug: string,
    lessonSlug: string
  ) =>
    `public/courses/${courseSlug}/modules/${moduleSlug}/lessons/${lessonSlug}`,
} as const;

// Student endpoints (require authentication)
export const studentEndpoints = {
  profile: "student/profile",
  updateProfile: "student/profile",
  enrollments: "student/enrollments",
  enroll: (courseId: string) => `student/courses/${courseId}/enroll`,
  courseById: (id: string) => `student/courses/${id}`,
  lessonById: (id: string) => `student/lessons/${id}`,
  completeLesson: (id: string) => `student/lessons/${id}/complete`,
  progress: "student/progress",
  courseProgress: (courseId: string) => `student/courses/${courseId}/progress`,
  // Payments
  payments: "student/payments",
  submitPayment: "student/payments",
  paymentById: (id: string) => `student/payments/${id}`,
} as const;

// Teacher endpoints (require teacher role)
export const teacherEndpoints = {
  // Dashboard & Profile
  dashboard: "teacher/dashboard",
  profile: "teacher/profile",
  updateProfile: "teacher/profile",
  branding: "teacher/branding",
  updateBranding: "teacher/branding",
  // Students
  students: "teacher/students",
  studentById: (id: string) => `teacher/students/${id}`,
  // Courses
  courses: "teacher/courses",
  courseById: (id: string) => `teacher/courses/${id}`,
  createCourse: "teacher/courses",
  updateCourse: (id: string) => `teacher/courses/${id}`,
  deleteCourse: (id: string) => `teacher/courses/${id}`,
  publishCourse: (id: string) => `teacher/courses/${id}/publish`,
  unpublishCourse: (id: string) => `teacher/courses/${id}/unpublish`,
  // Modules
  modules: "teacher/modules",
  moduleById: (id: string) => `teacher/modules/${id}`,
  createModule: "teacher/modules",
  updateModule: (id: string) => `teacher/modules/${id}`,
  deleteModule: (id: string) => `teacher/modules/${id}`,
  reorderModules: (courseId: string) =>
    `teacher/courses/${courseId}/modules/reorder`,
  // Lessons
  lessons: "teacher/lessons",
  lessonById: (id: string) => `teacher/lessons/${id}`,
  createLesson: "teacher/lessons",
  updateLesson: (id: string) => `teacher/lessons/${id}`,
  deleteLesson: (id: string) => `teacher/lessons/${id}`,
  reorderLessons: (moduleId: string) =>
    `teacher/modules/${moduleId}/lessons/reorder`,
  // Payments
  payments: "teacher/payments",
  paymentById: (id: string) => `teacher/payments/${id}`,
  approvePayment: (id: string) => `teacher/payments/${id}/approve`,
  rejectPayment: (id: string) => `teacher/payments/${id}/reject`,
  // Stats
  stats: "teacher/stats",
} as const;

// Onboarding endpoints (become a teacher)
export const onboardingEndpoints = {
  request: "onboarding/request",
  complete: "onboarding/complete",
  status: "onboarding/status",
} as const;

// Admin endpoints (require admin role)
export const adminEndpoints = {
  // Dashboard
  dashboard: "admin/dashboard",
  stats: "admin/stats",
  // Teachers
  teachers: "admin/teachers",
  teacherById: (id: string) => `admin/teachers/${id}`,
  // Teacher Requests
  teacherRequests: "admin/teacher-requests",
  teacherRequestById: (id: string) => `admin/teacher-requests/${id}`,
  approveRequest: (id: string) => `admin/teacher-requests/${id}/approve`,
  rejectRequest: (id: string) => `admin/teacher-requests/${id}/reject`,
  // Users
  users: "admin/users",
  userById: (id: string) => `admin/users/${id}`,
} as const;

// Blog API endpoints (legacy - keep for compatibility)
export const blogEndpoints = {
  // Public endpoints
  getAllBlogs: "blogs",
  getFeaturedBlogs: "blogs/featured",
  getBlogById: (id: string) => `blogs/${id}`,
  getRelatedBlogs: (id: string) => `blogs/${id}/related`,
  trackBlogView: (id: string) => `blogs/${id}/view`,

  // Category endpoints
  getCategories: "categories",
  getCategoryById: (id: string) => `categories/${id}`,
  getCategoryBySlug: (slug: string) => `categories/slug/${slug}`,
  getBlogsByCategory: (categoryId: string) => `categories/${categoryId}/blogs`,
  getCategoryStats: (categoryId: string) => `categories/${categoryId}/stats`,

  // Admin endpoints (require authentication)
  createBlog: "blogs",
  updateBlog: (id: string) => `blogs/${id}`,
  deleteBlog: (id: string) => `blogs/${id}`,
  archiveBlog: (id: string) => `blogs/${id}/archive`,
  unarchiveBlog: (id: string) => `blogs/${id}/unarchive`,
  getArchivedBlogs: "blogs/archive",

  createCategory: "categories",
  updateCategory: (id: string) => `categories/${id}`,
  activateCategory: (id: string) => `categories/${id}/activate`,
  deactivateCategory: (id: string) => `categories/${id}/deactivate`,
  deleteCategory: (id: string) => `categories/${id}`,
} as const;

// Course API endpoints (legacy - keep for compatibility)
export const courseEndpoints = {
  // Public endpoints
  getAllCourses: "courses",
  getCourseById: (id: string) => `courses/${id}`,
  getCourseBySlug: (slug: string) => `courses/slug/${slug}`,

  // Student endpoints (require authentication)
  getEnrolledCourses: "students/courses",
  enrollInCourse: (courseId: string) => `courses/${courseId}/enroll`,
  getCourseProgress: (courseId: string) => `courses/${courseId}/progress`,

  // Lesson endpoints
  getLessons: (courseId: string) => `courses/${courseId}/lessons`,
  getLessonById: (courseId: string, lessonId: string) =>
    `courses/${courseId}/lessons/${lessonId}`,
  completeLesson: (courseId: string, lessonId: string) =>
    `courses/${courseId}/lessons/${lessonId}/complete`,

  // Quiz endpoints
  getQuiz: (lessonId: string) => `lessons/${lessonId}/quiz`,
  submitQuiz: (lessonId: string) => `lessons/${lessonId}/quiz/submit`,
  getQuizAttempts: (studentId: string, lessonId: string) =>
    `students/${studentId}/quiz-attempts/${lessonId}`,

  // Teacher/Landing endpoints
  getTeacherLanding: (identifier: string) => `teachers/${identifier}/landing`,
  getTeacherCourses: (identifier: string) => `teachers/${identifier}/courses`,
} as const;

// Teacher Landing API endpoints (public)
export const landingEndpoints = {
  getPublicLanding: (identifier: string) => `landing/public/${identifier}`,
  getTeacherCourses: (identifier: string) => `teachers/${identifier}/courses`,
} as const;

// Notification API endpoints
export const notificationEndpoints = {
  getNotifications: (userId: string) => `notifications/user/${userId}`,
  markAsRead: (notificationId: string) =>
    `notifications/${notificationId}/read`,
  markAllAsRead: (userId: string) => `notifications/user/${userId}/read-all`,
  getUnreadCount: (userId: string) =>
    `notifications/user/${userId}/unread-count`,
} as const;

// Cache configuration
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
} as const;
