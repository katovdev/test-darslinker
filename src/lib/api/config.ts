export const apiConfig = {
  baseUrl: "https://api.darslinker.uz/api",
  timeout: 15000,
  retryAttempts: 2,
  retryDelay: 2000,
} as const;

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
  getCategories: "blogs/categories",
  adminBlogs: "admin/blogs",
  adminBlogById: (id: string) => `admin/blogs/${id}`,
  adminCategories: "admin/blog-categories",
  adminCategoryById: (id: string) => `admin/blog-categories/${id}`,
} as const;

export const coursesEndpoint = "courses" as const;

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
} as const;

export const teacherEndpoints = {
  stats: "teacher/stats",
  students: "teacher/students",
  payments: "teacher/payments",
  earnings: "teacher/earnings",
  courses: "teacher/courses",
} as const;

export const cacheConfig = {
  defaultTTL: 1 * 60 * 1000,
  maxSize: 100,
} as const;
