import {
  moderatorApi,
  type ModeratorStats,
  type ModeratorUser,
  type ModeratorUserDetail,
  type ModeratorCourse,
  type ModeratorCourseDetail,
  type ListUsersParams,
  type ListCoursesParams,
  type UpdateUserStatusInput,
  type UpdateCourseStatusInput,
  type Pagination,
} from "@/lib/api/moderator";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ModeratorService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  private getCacheKey(method: string, params: unknown = {}): string {
    return `moderator_${method}_${JSON.stringify(params)}`;
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
      logger.error("Moderator API request failed:", error);

      if (cached) {
        logger.warn("Moderator API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  async getStats(): Promise<ModeratorStats | null> {
    const cacheKey = this.getCacheKey("stats");

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        moderatorApi.getStats()
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch moderator stats:", error);
      return null;
    }
  }

  async listUsers(
    params?: ListUsersParams
  ): Promise<{ users: ModeratorUser[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("users", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        moderatorApi.listUsers(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch moderator users:", error);
      return null;
    }
  }

  async getUser(id: string): Promise<ModeratorUserDetail | null> {
    const cacheKey = this.getCacheKey("user", { id });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        moderatorApi.getUser(id)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch moderator user:", error);
      return null;
    }
  }

  async updateUserStatus(
    id: string,
    input: UpdateUserStatusInput
  ): Promise<ModeratorUser | null> {
    try {
      const response = await moderatorApi.updateUserStatus(id, input);

      if (response?.success && response.data) {
        this.clearCachePattern("users");
        this.clearCachePattern(`user_${JSON.stringify({ id })}`);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update moderator user status:", error);
      return null;
    }
  }

  async listCourses(
    params?: ListCoursesParams
  ): Promise<{ courses: ModeratorCourse[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("courses", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        moderatorApi.listCourses(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch moderator courses:", error);
      return null;
    }
  }

  async getCourse(id: string): Promise<ModeratorCourseDetail | null> {
    const cacheKey = this.getCacheKey("course", { id });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        moderatorApi.getCourse(id)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch moderator course:", error);
      return null;
    }
  }

  async updateCourseStatus(
    id: string,
    input: UpdateCourseStatusInput
  ): Promise<ModeratorCourse | null> {
    try {
      const response = await moderatorApi.updateCourseStatus(id, input);

      if (response?.success && response.data) {
        this.clearCachePattern("courses");
        this.clearCachePattern(`course_${JSON.stringify({ id })}`);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update moderator course status:", error);
      return null;
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

export const moderatorService = new ModeratorService();
export default moderatorService;
