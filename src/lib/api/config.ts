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
  getFeaturedBlogs: "blogs/featured",
  getBlogById: (id: string) => `blogs/${id}`,
  getRelatedBlogs: (id: string) => `blogs/${id}/related`,
  trackBlogView: (id: string) => `blogs/${id}/view`,
  getCategories: "categories",
  getCategoryById: (id: string) => `categories/${id}`,
  getCategoryBySlug: (slug: string) => `categories/slug/${slug}`,
  getBlogsByCategory: (categoryId: string) => `categories/${categoryId}/blogs`,
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

export const cacheConfig = {
  defaultTTL: 1 * 60 * 1000,
  maxSize: 100,
} as const;
