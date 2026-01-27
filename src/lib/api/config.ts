export const apiConfig = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL || "https://api.darslinker.uz/api",
  timeout: 15000,
  retryAttempts: 2,
  retryDelay: 2000,
};

export const authEndpoints = {
  requestOtp: "auth",
  login: "auth/login",
  refresh: "auth/refresh",
  logout: "auth/logout",
  me: "auth/me",
} as const;

export const blogEndpoints = {
  getAllBlogs: "blogs",
  getBlogBySlug: (slug: string) => `blogs/by-slug/${slug}`,
  toggleLike: (id: string) => `blogs/${id}/like`,
  trackView: (id: string) => `blogs/${id}/view`,
  getCategories: "blogs/categories",
  adminBlogs: "admin/blogs",
  adminBlogById: (id: string) => `admin/blogs/${id}`,
  adminCategories: "admin/blog-categories",
  adminCategoryById: (id: string) => `admin/blog-categories/${id}`,
} as const;

export const coursesEndpoint = "courses" as const;

export const teacherPublicEndpoints = {
  profile: (id: string) => `teachers/${id}`,
} as const;

export const adminEndpoints = {
  stats: "admin/stats",
  users: "admin/users",
  userById: (id: string) => `admin/users/${id}`,
  courses: "admin/courses",
  courseById: (id: string) => `admin/courses/${id}`,
  payments: "admin/payments",
  paymentById: (id: string) => `admin/payments/${id}`,
  earnings: "admin/earnings",
} as const;

export const moderatorEndpoints = {
  stats: "moderator/stats",
  users: "moderator/users",
  userById: (id: string) => `moderator/users/${id}`,
  courses: "moderator/courses",
  courseById: (id: string) => `moderator/courses/${id}`,
  teachers: "moderator/teachers",
  teacherById: (id: string) => `moderator/teachers/${id}`,
  advice: "moderator/advice",
  adviceById: (id: string) => `moderator/advice/${id}`,
  adviceStats: "moderator/advice/stats",
} as const;

export const teacherEndpoints = {
  stats: "teacher/stats",
  students: "teacher/students",
  payments: "teacher/payments",
  approvePayment: (id: string) => `teacher/payments/${id}/approve`,
  rejectPayment: (id: string) => `teacher/payments/${id}/reject`,
  earnings: "teacher/earnings",
  courses: "teacher/courses",
  courseById: (id: string) => `teacher/courses/${id}`,
} as const;

export const courseContentEndpoints = {
  // Course content overview (public endpoint for unauthenticated users)
  courseContent: (courseId: string) => `courses/${courseId}/content`,
  // Teacher-specific endpoints (authenticated)
  teacherCourseContent: (courseId: string) =>
    `teacher/courses/${courseId}/content`,
  // Modules
  modules: (courseId: string) => `teacher/courses/${courseId}/modules`,
  reorderModules: (courseId: string) =>
    `teacher/courses/${courseId}/modules/reorder`,
  moduleById: (moduleId: string) => `teacher/modules/${moduleId}`,
  // Lessons
  lessons: (moduleId: string) => `teacher/modules/${moduleId}/lessons`,
  reorderLessons: (moduleId: string) =>
    `teacher/modules/${moduleId}/lessons/reorder`,
  lessonById: (lessonId: string) => `teacher/lessons/${lessonId}`,
} as const;

export const studentEndpoints = {
  payments: "student/payments",
  paymentById: (id: string) => `student/payments/${id}`,
  coursePaymentInfo: (courseId: string) =>
    `student/courses/${courseId}/payment-info`,
} as const;

export const settingsEndpoints = {
  site: "settings/site",
  teachers: "settings/teachers",
  teacherById: (id: string) => `settings/teachers/${id}`,
} as const;

export const cacheConfig = {
  defaultTTL: 1 * 60 * 1000,
  maxSize: 100,
} as const;
