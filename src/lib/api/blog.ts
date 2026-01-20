import { api } from "./client";
import { blogEndpoints } from "./config";
import { logger } from "../logger";

// Types
export interface BlogTag {
  label: string;
  value: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogSection {
  content: string;
  type?: string;
}

export interface Blog {
  id: string;
  _id?: string;
  title: string;
  subtitle?: string;
  slug?: string;
  sections?: BlogSection[];
  tags?: BlogTag[];
  categoryId?: BlogCategory;
  multiViews?: number;
  isArchive?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogsResponse {
  success: boolean;
  data: Blog[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BlogResponse {
  success: boolean;
  data: Blog;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface BlogQueryParams {
  search?: string;
  category?: string;
  limit?: number;
  page?: number;
}

/**
 * Blog API Service
 * Handles public blog-related API calls
 */
class BlogAPI {
  /**
   * Get featured blogs for landing page
   */
  async getFeaturedBlogs(limit = 6): Promise<BlogsResponse> {
    try {
      return await api.get<BlogsResponse>(
        `${blogEndpoints.getFeaturedBlogs}?limit=${limit}`
      );
    } catch (error) {
      logger.error("Error fetching featured blogs:", error);
      throw error;
    }
  }

  /**
   * Get all blogs with optional filtering
   */
  async getAllBlogs(params: BlogQueryParams = {}): Promise<BlogsResponse> {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${blogEndpoints.getAllBlogs}?${queryString}`
        : blogEndpoints.getAllBlogs;

      return await api.get<BlogsResponse>(url);
    } catch (error) {
      logger.error("Error fetching blogs:", error);
      throw error;
    }
  }

  /**
   * Get single blog by ID
   */
  async getBlogById(id: string): Promise<BlogResponse> {
    try {
      return await api.get<BlogResponse>(blogEndpoints.getBlogById(id));
    } catch (error) {
      logger.error("Error fetching blog:", error);
      throw error;
    }
  }

  /**
   * Get related blogs
   */
  async getRelatedBlogs(id: string, limit = 5): Promise<BlogsResponse> {
    try {
      return await api.get<BlogsResponse>(
        `${blogEndpoints.getRelatedBlogs(id)}?limit=${limit}`
      );
    } catch (error) {
      logger.error("Error fetching related blogs:", error);
      throw error;
    }
  }

  /**
   * Track blog view (fire and forget)
   */
  async trackBlogView(id: string): Promise<void> {
    try {
      await api.post(blogEndpoints.trackBlogView(id));
    } catch (error) {
      // Silently fail - view tracking shouldn't disrupt UX
      logger.debug("View tracking failed:", error);
    }
  }

  /**
   * Get all categories
   */
  async getCategories(activeOnly = true): Promise<CategoriesResponse> {
    try {
      const params = activeOnly ? "?active=true" : "";
      return await api.get<CategoriesResponse>(
        `${blogEndpoints.getCategories}${params}`
      );
    } catch (error) {
      logger.error("Error fetching categories:", error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(
    slug: string
  ): Promise<{ success: boolean; data: Category }> {
    try {
      return await api.get(blogEndpoints.getCategoryBySlug(slug));
    } catch (error) {
      logger.error("Error fetching category by slug:", error);
      throw error;
    }
  }

  /**
   * Get blogs by category
   */
  async getBlogsByCategory(
    categoryId: string,
    params: BlogQueryParams = {}
  ): Promise<BlogsResponse> {
    try {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${blogEndpoints.getBlogsByCategory(categoryId)}?${queryString}`
        : blogEndpoints.getBlogsByCategory(categoryId);

      return await api.get<BlogsResponse>(url);
    } catch (error) {
      logger.error("Error fetching blogs by category:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const blogAPI = new BlogAPI();
export default blogAPI;
