import { api } from "./client";

export interface ReviewStudent {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  teacherResponse: string | null;
  teacherRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student: ReviewStudent;
}

export interface ReviewWithCourse extends Review {
  courseId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: Pagination;
  };
}

export interface SingleReviewResponse {
  success: boolean;
  data: Review | null;
}

export interface ReviewWithCourseResponse {
  success: boolean;
  data: ReviewWithCourse;
}

export interface RatingStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface RatingStatsResponse {
  success: boolean;
  data: RatingStats;
}

export interface CreateReviewInput {
  rating: number;
  comment: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface TeacherResponseInput {
  response: string;
}

export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "rating";
  sortOrder?: "asc" | "desc";
}

export interface DeleteResponse {
  success: boolean;
  data: {
    deleted: boolean;
  };
}

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

export const reviewEndpoints = {
  getReviews: (courseId: string) => `courses/${courseId}/reviews`,
  getRatingStats: (courseId: string) => `courses/${courseId}/rating`,

  createReview: (courseId: string) => `courses/${courseId}/reviews`,
  getMyReview: (courseId: string) => `courses/${courseId}/my-review`,
  updateReview: (reviewId: string) => `reviews/${reviewId}`,
  deleteReview: (reviewId: string) => `reviews/${reviewId}`,

  respondToReview: (reviewId: string) => `reviews/${reviewId}/respond`,

  adminDeleteReview: (reviewId: string) => `admin/reviews/${reviewId}`,

  getReviewById: (reviewId: string) => `reviews/${reviewId}`,
} as const;

export const reviewApi = {
  getReviews: (courseId: string, params?: ReviewQueryParams) => {
    const query = params
      ? buildQueryString(params as Record<string, unknown>)
      : "";
    return api.get<ReviewsResponse>(
      `${reviewEndpoints.getReviews(courseId)}${query ? `?${query}` : ""}`
    );
  },

  getRatingStats: (courseId: string) => {
    return api.get<RatingStatsResponse>(
      reviewEndpoints.getRatingStats(courseId)
    );
  },

  createReview: (courseId: string, input: CreateReviewInput) => {
    return api.post<SingleReviewResponse>(
      reviewEndpoints.createReview(courseId),
      input
    );
  },

  getMyReview: (courseId: string) => {
    return api.get<SingleReviewResponse>(reviewEndpoints.getMyReview(courseId));
  },

  updateReview: (reviewId: string, input: UpdateReviewInput) => {
    return api.put<SingleReviewResponse>(
      reviewEndpoints.updateReview(reviewId),
      input
    );
  },

  deleteReview: (reviewId: string) => {
    return api.delete<DeleteResponse>(reviewEndpoints.deleteReview(reviewId));
  },

  respondToReview: (reviewId: string, input: TeacherResponseInput) => {
    return api.post<SingleReviewResponse>(
      reviewEndpoints.respondToReview(reviewId),
      input
    );
  },

  adminDeleteReview: (reviewId: string) => {
    return api.delete<DeleteResponse>(
      reviewEndpoints.adminDeleteReview(reviewId)
    );
  },

  getReviewById: (reviewId: string) => {
    return api.get<ReviewWithCourseResponse>(
      reviewEndpoints.getReviewById(reviewId)
    );
  },
};

export default reviewApi;
