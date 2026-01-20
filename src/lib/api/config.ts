const isDevelopment = process.env.NODE_ENV === "development";

export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.darslinker.uz/api",
  timeout: isDevelopment ? 10000 : 15000,
  retryAttempts: isDevelopment ? 3 : 2,
  retryDelay: isDevelopment ? 1000 : 2000,
} as const;

export const authEndpoints = {
  requestOtp: "auth",
  login: "auth/login",
  refresh: "auth/refresh",
  logout: "auth/logout",
  me: "auth/me",
} as const;

// Blog API endpoints
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

// Courses endpoint
export const coursesEndpoint = "courses" as const;

// Cache configuration
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
} as const;
