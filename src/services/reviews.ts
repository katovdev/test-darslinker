import {
  reviewApi,
  type Review,
  type RatingStats,
  type ReviewQueryParams,
  type CreateReviewInput,
  type UpdateReviewInput,
  type TeacherResponseInput,
  type Pagination,
} from "@/lib/api/reviews";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

export interface TransformedReview {
  id: string;
  rating: number;
  comment: string;
  teacherResponse: string | null;
  teacherRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    fullName: string;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class ReviewService {
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

  private transformReview(review: Review): TransformedReview {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      teacherResponse: review.teacherResponse,
      teacherRespondedAt: review.teacherRespondedAt,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      student: {
        id: review.student.id,
        firstName: review.student.firstName,
        lastName: review.student.lastName,
        avatar: review.student.avatar,
        fullName: `${review.student.firstName} ${review.student.lastName}`,
      },
    };
  }

  async getReviews(
    courseId: string,
    params?: ReviewQueryParams
  ): Promise<{
    success: boolean;
    data: TransformedReview[];
    pagination?: Pagination;
  }> {
    const cacheKey = this.getCacheKey("reviews", { courseId, ...params });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        reviewApi.getReviews(courseId, params)
      );

      if (response?.success && response.data?.reviews) {
        return {
          success: true,
          data: response.data.reviews.map((r) => this.transformReview(r)),
          pagination: response.data.pagination,
        };
      }

      return { success: false, data: [] };
    } catch (error) {
      logger.error("Failed to fetch reviews:", error);
      return { success: false, data: [] };
    }
  }

  async getRatingStats(courseId: string): Promise<{
    success: boolean;
    data: RatingStats | null;
  }> {
    const cacheKey = this.getCacheKey("ratingStats", { courseId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        reviewApi.getRatingStats(courseId)
      );

      if (response?.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return { success: false, data: null };
    } catch (error) {
      logger.error("Failed to fetch rating stats:", error);
      return { success: false, data: null };
    }
  }

  async getMyReview(courseId: string): Promise<{
    success: boolean;
    data: TransformedReview | null;
  }> {
    try {
      const response = await reviewApi.getMyReview(courseId);

      if (response?.success && response.data) {
        return {
          success: true,
          data: this.transformReview(response.data),
        };
      }

      return { success: true, data: null };
    } catch (error) {
      logger.error("Failed to fetch my review:", error);
      return { success: false, data: null };
    }
  }

  async createReview(
    courseId: string,
    input: CreateReviewInput
  ): Promise<{
    success: boolean;
    data: TransformedReview | null;
    error?: string;
  }> {
    try {
      const response = await reviewApi.createReview(courseId, input);

      if (response?.success && response.data) {
        this.clearCacheForCourse(courseId);
        return {
          success: true,
          data: this.transformReview(response.data),
        };
      }

      return {
        success: false,
        data: null,
        error: (response as { error?: { message?: string } })?.error?.message,
      };
    } catch (error) {
      logger.error("Failed to create review:", error);
      return { success: false, data: null };
    }
  }

  async updateReview(
    reviewId: string,
    input: UpdateReviewInput,
    courseId?: string
  ): Promise<{
    success: boolean;
    data: TransformedReview | null;
    error?: string;
  }> {
    try {
      const response = await reviewApi.updateReview(reviewId, input);

      if (response?.success && response.data) {
        if (courseId) {
          this.clearCacheForCourse(courseId);
        }
        return {
          success: true,
          data: this.transformReview(response.data),
        };
      }

      return {
        success: false,
        data: null,
        error: (response as { error?: { message?: string } })?.error?.message,
      };
    } catch (error) {
      logger.error("Failed to update review:", error);
      return { success: false, data: null };
    }
  }

  async deleteReview(
    reviewId: string,
    courseId?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await reviewApi.deleteReview(reviewId);

      if (response?.success) {
        if (courseId) {
          this.clearCacheForCourse(courseId);
        }
        return { success: true };
      }

      return {
        success: false,
        error: (response as { error?: { message?: string } })?.error?.message,
      };
    } catch (error) {
      logger.error("Failed to delete review:", error);
      return { success: false };
    }
  }

  async respondToReview(
    reviewId: string,
    input: TeacherResponseInput,
    courseId?: string
  ): Promise<{
    success: boolean;
    data: TransformedReview | null;
    error?: string;
  }> {
    try {
      const response = await reviewApi.respondToReview(reviewId, input);

      if (response?.success && response.data) {
        if (courseId) {
          this.clearCacheForCourse(courseId);
        }
        return {
          success: true,
          data: this.transformReview(response.data),
        };
      }

      return {
        success: false,
        data: null,
        error: (response as { error?: { message?: string } })?.error?.message,
      };
    } catch (error) {
      logger.error("Failed to respond to review:", error);
      return { success: false, data: null };
    }
  }

  async adminDeleteReview(
    reviewId: string,
    courseId?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const response = await reviewApi.adminDeleteReview(reviewId);

      if (response?.success) {
        if (courseId) {
          this.clearCacheForCourse(courseId);
        }
        return { success: true };
      }

      return {
        success: false,
        error: (response as { error?: { message?: string } })?.error?.message,
      };
    } catch (error) {
      logger.error("Failed to delete review:", error);
      return { success: false };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForCourse(courseId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(courseId)) {
        this.cache.delete(key);
      }
    }
  }

  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;
