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

// Blog API endpoints
export const blogEndpoints = {
  // Public endpoints
  getAllBlogs: "/blogs",
  getFeaturedBlogs: "/blogs/featured",
  getBlogById: (id: string) => `/blogs/${id}`,
  getRelatedBlogs: (id: string) => `/blogs/${id}/related`,
  trackBlogView: (id: string) => `/blogs/${id}/view`,

  // Category endpoints
  getCategories: "/categories",
  getCategoryById: (id: string) => `/categories/${id}`,
  getCategoryBySlug: (slug: string) => `/categories/slug/${slug}`,
  getBlogsByCategory: (categoryId: string) => `/categories/${categoryId}/blogs`,
  getCategoryStats: (categoryId: string) => `/categories/${categoryId}/stats`,

  // Admin endpoints (require authentication)
  createBlog: "/blogs",
  updateBlog: (id: string) => `/blogs/${id}`,
  deleteBlog: (id: string) => `/blogs/${id}`,
  archiveBlog: (id: string) => `/blogs/${id}/archive`,
  unarchiveBlog: (id: string) => `/blogs/${id}/unarchive`,
  getArchivedBlogs: "/blogs/archive",

  createCategory: "/categories",
  updateCategory: (id: string) => `/categories/${id}`,
  activateCategory: (id: string) => `/categories/${id}/activate`,
  deactivateCategory: (id: string) => `/categories/${id}/deactivate`,
  deleteCategory: (id: string) => `/categories/${id}`,
} as const;

// Course API endpoints
export const courseEndpoints = {
  // Public endpoints
  getAllCourses: "/courses",
  getCourseById: (id: string) => `/courses/${id}`,
  getCourseBySlug: (slug: string) => `/courses/slug/${slug}`,

  // Student endpoints (require authentication)
  getEnrolledCourses: "/students/courses",
  enrollInCourse: (courseId: string) => `/courses/${courseId}/enroll`,
  getCourseProgress: (courseId: string) => `/courses/${courseId}/progress`,

  // Lesson endpoints
  getLessons: (courseId: string) => `/courses/${courseId}/lessons`,
  getLessonById: (courseId: string, lessonId: string) =>
    `/courses/${courseId}/lessons/${lessonId}`,
  completeLesson: (courseId: string, lessonId: string) =>
    `/courses/${courseId}/lessons/${lessonId}/complete`,

  // Quiz endpoints
  getQuiz: (lessonId: string) => `/lessons/${lessonId}/quiz`,
  submitQuiz: (lessonId: string) => `/lessons/${lessonId}/quiz/submit`,
  getQuizAttempts: (studentId: string, lessonId: string) =>
    `/students/${studentId}/quiz-attempts/${lessonId}`,

  // Teacher/Landing endpoints
  getTeacherLanding: (identifier: string) => `/teachers/${identifier}/landing`,
  getTeacherCourses: (identifier: string) => `/teachers/${identifier}/courses`,
} as const;

// Teacher Landing API endpoints (public)
export const landingEndpoints = {
  getPublicLanding: (identifier: string) => `/landing/public/${identifier}`,
  getTeacherCourses: (identifier: string) => `/teachers/${identifier}/courses`,
} as const;

// Notification API endpoints
export const notificationEndpoints = {
  getNotifications: (userId: string) => `/notifications/user/${userId}`,
  markAsRead: (notificationId: string) =>
    `/notifications/${notificationId}/read`,
  markAllAsRead: (userId: string) => `/notifications/user/${userId}/read-all`,
  getUnreadCount: (userId: string) =>
    `/notifications/user/${userId}/unread-count`,
} as const;

// Cache configuration
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
} as const;
