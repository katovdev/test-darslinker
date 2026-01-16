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

// Cache configuration
export const cacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
} as const;
