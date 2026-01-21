import {
  studentApi,
  type StudentPayment,
  type CoursePaymentInfo,
  type ListPaymentsParams,
} from "@/lib/api/student";
import type { Pagination } from "@/lib/api/teacher";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class StudentService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  private getCacheKey(method: string, params: unknown = {}): string {
    return `student_${method}_${JSON.stringify(params)}`;
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
      logger.error("Student API request failed:", error);

      if (cached) {
        logger.warn("Student API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  async getCoursePaymentInfo(
    courseId: string
  ): Promise<CoursePaymentInfo | null> {
    const cacheKey = this.getCacheKey("coursePaymentInfo", { courseId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        studentApi.getCoursePaymentInfo(courseId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch course payment info:", error);
      return null;
    }
  }

  async createPayment(
    courseId: string,
    amount: number,
    checkImage: File
  ): Promise<StudentPayment | null> {
    try {
      const response = await studentApi.createPayment(
        courseId,
        amount,
        checkImage
      );

      if (response?.success && response.data) {
        this.clearCachePattern("payments");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to create payment:", error);
      return null;
    }
  }

  async getPayment(paymentId: string): Promise<StudentPayment | null> {
    const cacheKey = this.getCacheKey("payment", { paymentId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        studentApi.getPayment(paymentId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch payment:", error);
      return null;
    }
  }

  async listPayments(
    params?: ListPaymentsParams
  ): Promise<{ payments: StudentPayment[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("payments", params);

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        studentApi.listPayments(params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch student payments:", error);
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

export const studentService = new StudentService();
export default studentService;
