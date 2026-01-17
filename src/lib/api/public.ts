/**
 * Public API Module
 * Handles public endpoints for teacher subdomains (no auth required)
 */

import { api } from "./client";
import { publicEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface TenantInfo {
  teacherId: string;
  username: string;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

export interface PublicTeacher {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  } | null;
}

export interface PublicCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  status: "draft" | "published" | "archived";
  moduleCount: number;
  lessonCount: number;
  enrolledCount: number;
  teacher: PublicTeacher;
  createdAt: string;
  updatedAt: string;
}

export interface PublicModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessonCount: number;
  lessons: PublicLesson[];
}

export interface PublicLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "video" | "text" | "quiz" | "assignment";
  order: number;
  duration: number | null;
  isFree: boolean;
}

export interface PublicCourseDetail extends PublicCourse {
  modules: PublicModule[];
}

export interface PublicModuleDetail extends PublicModule {
  course: {
    id: string;
    slug: string;
    title: string;
  };
}

export interface PublicLessonDetail extends PublicLesson {
  content: string | null;
  videoUrl: string | null;
  attachments: {
    name: string;
    url: string;
    size: number;
  }[];
  module: {
    id: string;
    slug: string;
    title: string;
  };
  course: {
    id: string;
    slug: string;
    title: string;
  };
}

// Response types
export interface TenantResponse {
  success: boolean;
  data: TenantInfo;
}

export interface PublicCoursesResponse {
  success: boolean;
  data: PublicCourse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PublicCourseResponse {
  success: boolean;
  data: PublicCourseDetail;
}

export interface PublicModuleResponse {
  success: boolean;
  data: PublicModuleDetail;
}

export interface PublicLessonResponse {
  success: boolean;
  data: PublicLessonDetail;
}

export interface PublicCoursesQueryParams {
  search?: string;
  status?: "published";
  limit?: number;
  page?: number;
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Public API Service
 * For accessing public content on teacher subdomains
 */
class PublicAPI {
  /**
   * Get tenant information for the current subdomain
   */
  async getTenant(): Promise<TenantResponse> {
    try {
      return await api.get<TenantResponse>(publicEndpoints.getTenant);
    } catch (error) {
      logger.error("Error fetching tenant:", error);
      throw error;
    }
  }

  /**
   * Get all published courses for the current tenant
   */
  async getCourses(
    params: PublicCoursesQueryParams = {}
  ): Promise<PublicCoursesResponse> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${publicEndpoints.getCourses}?${queryString}`
        : publicEndpoints.getCourses;

      return await api.get<PublicCoursesResponse>(url);
    } catch (error) {
      logger.error("Error fetching public courses:", error);
      throw error;
    }
  }

  /**
   * Get course detail by slug
   */
  async getCourseBySlug(slug: string): Promise<PublicCourseResponse> {
    try {
      return await api.get<PublicCourseResponse>(
        publicEndpoints.getCourseBySlug(slug)
      );
    } catch (error) {
      logger.error("Error fetching course by slug:", error);
      throw error;
    }
  }

  /**
   * Get module detail by slug
   */
  async getModuleBySlug(
    courseSlug: string,
    moduleSlug: string
  ): Promise<PublicModuleResponse> {
    try {
      return await api.get<PublicModuleResponse>(
        publicEndpoints.getModuleBySlug(courseSlug, moduleSlug)
      );
    } catch (error) {
      logger.error("Error fetching module by slug:", error);
      throw error;
    }
  }

  /**
   * Get lesson detail by slug (only works for free lessons)
   */
  async getLessonBySlug(
    courseSlug: string,
    moduleSlug: string,
    lessonSlug: string
  ): Promise<PublicLessonResponse> {
    try {
      return await api.get<PublicLessonResponse>(
        publicEndpoints.getLessonBySlug(courseSlug, moduleSlug, lessonSlug)
      );
    } catch (error) {
      logger.error("Error fetching lesson by slug:", error);
      throw error;
    }
  }
}

export const publicAPI = new PublicAPI();
export default publicAPI;
