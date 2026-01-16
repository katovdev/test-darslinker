import { blogAPI, type Blog, type BlogsResponse, type BlogQueryParams } from "@/lib/api/blog";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

// Types for transformed data
export interface TransformedBlog {
  id: string;
  title: string;
  description: string;
  views: number;
  date: string;
  category: string | null;
  slug: string;
  tags: Array<{ label: string; value: string }>;
  isArchived: boolean;
  isFallback?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Blog Service
 * Handles blog-related business logic and data transformation
 */
class BlogService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  /**
   * Get cache key for a request
   */
  private getCacheKey(method: string, params: unknown = {}): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid<T>(cacheEntry: CacheEntry<T> | undefined): boolean {
    return (
      !!cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTimeout
    );
  }

  /**
   * Get cached data or fetch from API
   */
  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (this.isCacheValid(cached)) {
      return cached!.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      logger.error("API request failed:", error);

      // If API fails and we have stale cache, use it
      if (cached) {
        logger.warn("API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  /**
   * Transform blog data for landing page display
   */
  private transformBlogsForLanding(blogs: Blog[]): TransformedBlog[] {
    return blogs.map((blog) => ({
      id: blog.id || blog._id || "",
      title: blog.title,
      description:
        blog.subtitle ||
        this.truncateText(blog.sections?.[0]?.content || "", 100),
      views: blog.multiViews || 0,
      date: this.formatDate(blog.createdAt),
      category: blog.categoryId?.name || null,
      slug: blog.slug || blog.id || blog._id || "",
      tags: blog.tags || [],
      isArchived: blog.isArchive || false,
    }));
  }

  /**
   * Get fallback blogs when API is unavailable
   */
  private getFallbackBlogs(limit = 6): TransformedBlog[] {
    const fallbackBlogs: TransformedBlog[] = [
      {
        id: "fallback-1",
        title: "Samarali Dars O'tish Usullari",
        description:
          "O'qituvchilar uchun samarali dars o'tish metodlari va zamonaviy yondashuvlar haqida batafsil ma'lumot",
        views: 1245,
        date: "15/12/2024",
        category: "Ta'lim metodikasi",
        slug: "samarali-dars-otish",
        tags: [{ label: "Metodika", value: "metodika" }],
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-2",
        title: "Raqamli Ta'lim Vositalari",
        description:
          "Zamonaviy raqamli texnologiyalardan ta'limda foydalanish va ularning samaradorligi",
        views: 987,
        date: "12/12/2024",
        category: "Texnologiya",
        slug: "raqamli-talim-vositalari",
        tags: [{ label: "Texnologiya", value: "texnologiya" }],
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-3",
        title: "O'quvchilar Motivatsiyasi",
        description:
          "O'quvchilarni darsga qiziqtirish va motivatsiyasini oshirish bo'yicha amaliy maslahatlar",
        views: 1567,
        date: "10/12/2024",
        category: "Psixologiya",
        slug: "oquvchilar-motivatsiyasi",
        tags: [{ label: "Motivatsiya", value: "motivatsiya" }],
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-4",
        title: "Onlayn Darslar Tashkil Etish",
        description:
          "Masofaviy ta'lim sharoitida sifatli onlayn darslar o'tkazish bo'yicha ko'rsatmalar",
        views: 2134,
        date: "08/12/2024",
        category: "Onlayn ta'lim",
        slug: "onlayn-darslar-tashkil-etish",
        tags: [{ label: "Onlayn", value: "onlayn" }],
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-5",
        title: "Baholash Tizimlari",
        description:
          "O'quvchilar bilimini obyektiv baholash usullari va zamonaviy baholash tizimlari",
        views: 876,
        date: "05/12/2024",
        category: "Baholash",
        slug: "baholash-tizimlari",
        tags: [{ label: "Baholash", value: "baholash" }],
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-6",
        title: "Kreativ Dars Rejalashtirish",
        description:
          "Ijodiy va qiziqarli dars rejalarini tuzish, interaktiv mashg'ulotlar o'tkazish",
        views: 1432,
        date: "03/12/2024",
        category: "Rejalashtirish",
        slug: "kreativ-dars-rejalashtirish",
        tags: [{ label: "Kreativlik", value: "kreativlik" }],
        isArchived: false,
        isFallback: true,
      },
    ];

    return fallbackBlogs.slice(0, Math.min(limit, fallbackBlogs.length));
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text || "";
    return text.substring(0, maxLength).trim() + "...";
  }

  /**
   * Format date for display
   */
  private formatDate(date: string | Date): string {
    if (!date) return "";

    try {
      const dateObj = new Date(date);
      const day = dateObj.getDate().toString().padStart(2, "0");
      const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
      const year = dateObj.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      logger.error("Error formatting date");
      return "";
    }
  }

  /**
   * Get featured blogs for landing page with fallback content
   */
  async getFeaturedBlogsForLanding(limit = 6): Promise<TransformedBlog[]> {
    const cacheKey = this.getCacheKey("featuredBlogs", { limit });

    try {
      logger.log("Fetching featured blogs from API...");

      const response = await this.getCachedOrFetch(cacheKey, () =>
        blogAPI.getFeaturedBlogs(limit)
      );

      if (response?.success && response.data?.length > 0) {
        logger.log("Got real blogs from API:", response.data.length);
        return this.transformBlogsForLanding(response.data);
      } else {
        logger.log("No real blogs found, using fallback");
        return this.getFallbackBlogs(limit);
      }
    } catch {
      logger.error("Failed to fetch featured blogs");
      return this.getFallbackBlogs(limit);
    }
  }

  /**
   * Get all blogs with pagination and filtering
   */
  async getAllBlogs(params: BlogQueryParams = {}): Promise<BlogsResponse> {
    const cacheKey = this.getCacheKey("allBlogs", params);
    return this.getCachedOrFetch(cacheKey, () => blogAPI.getAllBlogs(params));
  }

  /**
   * Get single blog by ID
   */
  async getBlogById(id: string) {
    const cacheKey = this.getCacheKey("blogById", { id });

    const response = await this.getCachedOrFetch(cacheKey, () =>
      blogAPI.getBlogById(id)
    );

    // Track view asynchronously (fire and forget)
    this.trackBlogView(id);

    return response;
  }

  /**
   * Track blog view (fire and forget)
   */
  async trackBlogView(id: string): Promise<void> {
    try {
      await blogAPI.trackBlogView(id);
    } catch {
      // Silently fail
      logger.debug("View tracking failed");
    }
  }

  /**
   * Get related blogs
   */
  async getRelatedBlogs(id: string, limit = 5) {
    const cacheKey = this.getCacheKey("relatedBlogs", { id, limit });
    return this.getCachedOrFetch(cacheKey, () =>
      blogAPI.getRelatedBlogs(id, limit)
    );
  }

  /**
   * Get all categories
   */
  async getCategories(activeOnly = true) {
    const cacheKey = this.getCacheKey("categories", { activeOnly });
    return this.getCachedOrFetch(cacheKey, () =>
      blogAPI.getCategories(activeOnly)
    );
  }

  /**
   * Get blogs by category
   */
  async getBlogsByCategory(categoryId: string, params: BlogQueryParams = {}) {
    const cacheKey = this.getCacheKey("blogsByCategory", {
      categoryId,
      ...params,
    });
    return this.getCachedOrFetch(cacheKey, () =>
      blogAPI.getBlogsByCategory(categoryId, params)
    );
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clear specific cache entries by pattern
   */
  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const entry of this.cache.values()) {
      const cacheEntry = entry as CacheEntry<unknown>;
      if (now - cacheEntry.timestamp < this.cacheTimeout) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      cacheTimeout: this.cacheTimeout,
    };
  }
}

// Export singleton instance
export const blogService = new BlogService();
export default blogService;
