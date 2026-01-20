import {
  blogApi,
  type Blog,
  type BlogsResponse,
  type BlogQueryParams,
  type BlogCategory,
} from "@/lib/api/blog";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

export interface TransformedBlog {
  id: string;
  title: string;
  description: string;
  likesCount: number;
  date: string;
  category: string | null;
  slug: string;
  thumbnail?: string | null;
  isArchived: boolean;
  isFallback?: boolean;
  isLiked?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class BlogService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;


  private getCacheKey(method: string, params: unknown = {}): string {
    return `${method}_${JSON.stringify(params)}`;
  }


  private isCacheValid<T>(cacheEntry: CacheEntry<T> | undefined): boolean {
    return (
      !!cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTimeout
    );
  }


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

      if (cached) {
        logger.warn("API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }


  private transformBlog(blog: Blog): TransformedBlog {
    return {
      id: blog.id,
      title: blog.title,
      description: blog.subtitle || "",
      likesCount: blog.likesCount || 0,
      date: this.formatDate(blog.publishedAt || blog.createdAt),
      category: blog.category?.name || null,
      slug: blog.slug,
      thumbnail: blog.thumbnail,
      isArchived: blog.isArchive || false,
      isLiked: blog.isLiked || false,
    };
  }


  private transformBlogs(blogs: Blog[]): TransformedBlog[] {
    return blogs.map((blog) => this.transformBlog(blog));
  }


  private getFallbackBlogs(limit = 6): TransformedBlog[] {
    const fallbackBlogs: TransformedBlog[] = [
      {
        id: "fallback-1",
        title: "Samarali Dars O'tish Usullari",
        description:
          "O'qituvchilar uchun samarali dars o'tish metodlari va zamonaviy yondashuvlar haqida batafsil ma'lumot",
        likesCount: 24,
        date: "15/12/2024",
        category: "Ta'lim metodikasi",
        slug: "samarali-dars-otish",
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-2",
        title: "Raqamli Ta'lim Vositalari",
        description:
          "Zamonaviy raqamli texnologiyalardan ta'limda foydalanish va ularning samaradorligi",
        likesCount: 18,
        date: "12/12/2024",
        category: "Texnologiya",
        slug: "raqamli-talim-vositalari",
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-3",
        title: "O'quvchilar Motivatsiyasi",
        description:
          "O'quvchilarni darsga qiziqtirish va motivatsiyasini oshirish bo'yicha amaliy maslahatlar",
        likesCount: 32,
        date: "10/12/2024",
        category: "Psixologiya",
        slug: "oquvchilar-motivatsiyasi",
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-4",
        title: "Onlayn Darslar Tashkil Etish",
        description:
          "Masofaviy ta'lim sharoitida sifatli onlayn darslar o'tkazish bo'yicha ko'rsatmalar",
        likesCount: 45,
        date: "08/12/2024",
        category: "Onlayn ta'lim",
        slug: "onlayn-darslar-tashkil-etish",
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-5",
        title: "Baholash Tizimlari",
        description:
          "O'quvchilar bilimini obyektiv baholash usullari va zamonaviy baholash tizimlari",
        likesCount: 15,
        date: "05/12/2024",
        category: "Baholash",
        slug: "baholash-tizimlari",
        isArchived: false,
        isFallback: true,
      },
      {
        id: "fallback-6",
        title: "Kreativ Dars Rejalashtirish",
        description:
          "Ijodiy va qiziqarli dars rejalarini tuzish, interaktiv mashg'ulotlar o'tkazish",
        likesCount: 28,
        date: "03/12/2024",
        category: "Rejalashtirish",
        slug: "kreativ-dars-rejalashtirish",
        isArchived: false,
        isFallback: true,
      },
    ];

    return fallbackBlogs.slice(0, Math.min(limit, fallbackBlogs.length));
  }


  private formatDate(date: string | Date | null | undefined): string {
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


  async getFeaturedBlogsForLanding(limit = 6): Promise<TransformedBlog[]> {
    const cacheKey = this.getCacheKey("featuredBlogs", { limit });

    try {
      logger.log("Fetching featured blogs from API...");

      const response = await this.getCachedOrFetch(cacheKey, () =>
        blogApi.getBlogs({ limit, page: 1 })
      );

      if (response?.success && response.data?.blogs?.length > 0) {
        logger.log("Got real blogs from API:", response.data.blogs.length);
        return this.transformBlogs(response.data.blogs);
      } else {
        logger.log("No real blogs found, using fallback");
        return this.getFallbackBlogs(limit);
      }
    } catch {
      logger.error("Failed to fetch featured blogs");
      return this.getFallbackBlogs(limit);
    }
  }


  async getAllBlogs(params: BlogQueryParams = {}): Promise<{
    success: boolean;
    data: TransformedBlog[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const cacheKey = this.getCacheKey("allBlogs", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        blogApi.getBlogs(params)
      );

      if (response?.success && response.data?.blogs) {
        return {
          success: true,
          data: this.transformBlogs(response.data.blogs),
          pagination: response.data.pagination,
        };
      }

      return {
        success: false,
        data: [],
      };
    } catch (error) {
      logger.error("Failed to fetch blogs:", error);
      return {
        success: false,
        data: [],
      };
    }
  }


  async getBlogBySlug(slug: string): Promise<{
    success: boolean;
    data?: TransformedBlog & { content?: string };
  }> {
    const cacheKey = this.getCacheKey("blogBySlug", { slug });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        blogApi.getBlogBySlug(slug)
      );

      if (response?.success && response.data) {
        return {
          success: true,
          data: {
            ...this.transformBlog(response.data),
            content: response.data.content,
          },
        };
      }

      return { success: false };
    } catch (error) {
      logger.error("Failed to fetch blog:", error);
      return { success: false };
    }
  }


  async toggleLike(blogId: string): Promise<{
    success: boolean;
    liked?: boolean;
    likesCount?: number;
  }> {
    try {
      const response = await blogApi.toggleLike(blogId);

      if (response?.success && response.data) {
        this.clearCachePattern("allBlogs");
        this.clearCachePattern("featuredBlogs");
        this.clearCachePattern("blogBySlug");

        return {
          success: true,
          liked: response.data.liked,
          likesCount: response.data.likesCount,
        };
      }

      return { success: false };
    } catch (error) {
      logger.error("Failed to toggle like:", error);
      return { success: false };
    }
  }


  async getCategories(): Promise<{
    success: boolean;
    data: BlogCategory[];
  }> {
    const cacheKey = this.getCacheKey("categories", {});

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        blogApi.getCategories()
      );

      if (response?.success && response.data?.categories) {
        return {
          success: true,
          data: response.data.categories,
        };
      }

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      logger.error("Failed to fetch categories:", error);
      return {
        success: true,
        data: [],
      };
    }
  }


  clearCache(): void {
    this.cache.clear();
  }


  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }


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

export const blogService = new BlogService();
export default blogService;
