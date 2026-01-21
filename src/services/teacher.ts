import {
  teacherApi,
  type TeacherStats,
  type TeacherStudent,
  type TeacherPayment,
  type TeacherEarnings,
  type TeacherCourse,
  type ListStudentsParams,
  type ListPaymentsParams,
  type ListCoursesParams,
  type Pagination,
} from "@/lib/api/teacher";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class TeacherService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  private getCacheKey(method: string, params: unknown = {}): string {
    return `teacher_${method}_${JSON.stringify(params)}`;
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
      logger.error("Teacher API request failed:", error);

      if (cached) {
        logger.warn("Teacher API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  async getStats(): Promise<TeacherStats | null> {
    const cacheKey = this.getCacheKey("stats");

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.getStats()
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch teacher stats:", error);
      return null;
    }
  }

  async listStudents(
    params?: ListStudentsParams
  ): Promise<{ students: TeacherStudent[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("students", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.listStudents(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch teacher students:", error);
      return null;
    }
  }

  async listPayments(
    params?: ListPaymentsParams
  ): Promise<{ payments: TeacherPayment[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("payments", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.listPayments(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch teacher payments:", error);
      return null;
    }
  }

  async getEarnings(): Promise<TeacherEarnings | null> {
    const cacheKey = this.getCacheKey("earnings");

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.getEarnings()
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch teacher earnings:", error);
      return null;
    }
  }

  async listCourses(
    params?: ListCoursesParams
  ): Promise<{ courses: TeacherCourse[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("courses", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.listCourses(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch teacher courses:", error);
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
}

export const teacherService = new TeacherService();
export default teacherService;
