import {
  adminApi,
  type AdminStats,
  type AdminUser,
  type AdminUserDetail,
  type AdminCourse,
  type AdminCourseDetail,
  type AdminPayment,
  type AdminEarning,
  type ListUsersParams,
  type ListCoursesParams,
  type ListPaymentsParams,
  type ListEarningsParams,
  type UpdateUserInput,
  type UpdateCourseStatusInput,
  type UpdatePaymentInput,
  type Pagination,
} from "@/lib/api/admin";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class AdminService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  private getCacheKey(method: string, params: unknown = {}): string {
    return `admin_${method}_${JSON.stringify(params)}`;
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
      logger.error("Admin API request failed:", error);

      if (cached) {
        logger.warn("Admin API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  async getStats(): Promise<AdminStats | null> {
    const cacheKey = this.getCacheKey("stats");

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.getStats()
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin stats:", error);
      return null;
    }
  }

  async listUsers(
    params?: ListUsersParams
  ): Promise<{ users: AdminUser[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("users", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.listUsers(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin users:", error);
      return null;
    }
  }

  async getUser(id: string): Promise<AdminUserDetail | null> {
    const cacheKey = this.getCacheKey("user", { id });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.getUser(id)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin user:", error);
      return null;
    }
  }

  async updateUser(
    id: string,
    input: UpdateUserInput
  ): Promise<AdminUser | null> {
    try {
      const response = await adminApi.updateUser(id, input);

      if (response?.success && response.data) {
        this.clearCachePattern("users");
        this.clearCachePattern(`user_${JSON.stringify({ id })}`);
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update admin user:", error);
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const response = await adminApi.deleteUser(id);

      if (response?.success && response.data?.deleted) {
        this.clearCachePattern("users");
        this.clearCachePattern("stats");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete admin user:", error);
      return false;
    }
  }

  async listCourses(
    params?: ListCoursesParams
  ): Promise<{ courses: AdminCourse[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("courses", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.listCourses(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin courses:", error);
      return null;
    }
  }

  async getCourse(id: string): Promise<AdminCourseDetail | null> {
    const cacheKey = this.getCacheKey("course", { id });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.getCourse(id)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin course:", error);
      return null;
    }
  }

  async updateCourseStatus(
    id: string,
    input: UpdateCourseStatusInput
  ): Promise<AdminCourse | null> {
    try {
      const response = await adminApi.updateCourseStatus(id, input);

      if (response?.success && response.data) {
        this.clearCachePattern("courses");
        this.clearCachePattern(`course_${JSON.stringify({ id })}`);
        return response.data as AdminCourse;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update admin course status:", error);
      return null;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      const response = await adminApi.deleteCourse(id);

      if (response?.success && response.data?.deleted) {
        this.clearCachePattern("courses");
        this.clearCachePattern("stats");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete admin course:", error);
      return false;
    }
  }

  async listPayments(
    params?: ListPaymentsParams
  ): Promise<{ payments: AdminPayment[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("payments", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.listPayments(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin payments:", error);
      return null;
    }
  }

  async getPayment(id: string): Promise<AdminPayment | null> {
    const cacheKey = this.getCacheKey("payment", { id });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.getPayment(id)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin payment:", error);
      return null;
    }
  }

  async updatePayment(
    id: string,
    input: UpdatePaymentInput
  ): Promise<AdminPayment | null> {
    try {
      const response = await adminApi.updatePayment(id, input);

      if (response?.success && response.data) {
        this.clearCachePattern("payments");
        this.clearCachePattern(`payment_${JSON.stringify({ id })}`);
        this.clearCachePattern("stats");
        this.clearCachePattern("earnings");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update admin payment:", error);
      return null;
    }
  }

  async listEarnings(
    params?: ListEarningsParams
  ): Promise<{ earnings: AdminEarning[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("earnings", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        adminApi.listEarnings(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch admin earnings:", error);
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

export const adminService = new AdminService();
export default adminService;
