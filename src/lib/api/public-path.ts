/**
 * Path-based Public API Module
 * Handles public endpoints for path-based teacher pages (no subdomain required)
 * Routes: /<username>, /<username>/<course-slug>, /<username>/<course-slug>/<lesson-slug>
 */

import { api } from "./client";
import { publicPathEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface PathTeacher {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  specialization: string | null;
}

export interface TeacherStats {
  studentsCount: number;
  coursesCount: number;
}

export interface PathCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  type: "free" | "paid";
  modulesCount: number;
  lessonsCount: number;
  enrollmentsCount: number;
  createdAt: string;
}

export interface PathModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessonsCount: number;
  lessons: PathLesson[];
}

export interface PathLesson {
  id: string;
  slug: string;
  title: string;
  order: number;
  durationMins: number;
  type: "video" | "text" | "quiz" | "assignment";
}

export interface PathCourseDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  type: "free" | "paid";
  totalDuration: number;
  enrollmentsCount: number;
  createdAt: string;
  modules: PathModule[];
}

export interface PathLessonDetail {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  order: number;
  durationMins: number;
  type: "video" | "text" | "quiz" | "assignment";
}

export interface LessonNavigation {
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

// Response types
export interface TeacherLandingResponse {
  success: boolean;
  data: {
    teacher: PathTeacher;
    stats: TeacherStats;
  };
}

export interface TeacherCoursesResponse {
  success: boolean;
  data: {
    teacher: Pick<PathTeacher, "id" | "username" | "fullName" | "businessName">;
    courses: PathCourse[];
  };
}

export interface CourseByPathResponse {
  success: boolean;
  data: {
    teacher: Pick<
      PathTeacher,
      | "id"
      | "username"
      | "fullName"
      | "businessName"
      | "logoUrl"
      | "specialization"
    >;
    course: PathCourseDetail;
  };
}

export interface LessonByPathResponse {
  success: boolean;
  data: {
    teacher: Pick<PathTeacher, "id" | "username" | "fullName">;
    course: { id: string; title: string; slug: string };
    module: { id: string; title: string; slug: string };
    lesson: PathLessonDetail;
    navigation: LessonNavigation;
  };
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Path-based Public API Service
 * For accessing public content via username path routes
 */
class PublicPathAPI {
  /**
   * Get teacher landing page data by username
   */
  async getTeacherLanding(username: string): Promise<TeacherLandingResponse> {
    try {
      return await api.get<TeacherLandingResponse>(
        publicPathEndpoints.getTeacherLanding(username)
      );
    } catch (error) {
      logger.error("Error fetching teacher landing:", error);
      throw error;
    }
  }

  /**
   * Get teacher's courses by username
   */
  async getTeacherCourses(username: string): Promise<TeacherCoursesResponse> {
    try {
      return await api.get<TeacherCoursesResponse>(
        publicPathEndpoints.getTeacherCourses(username)
      );
    } catch (error) {
      logger.error("Error fetching teacher courses:", error);
      throw error;
    }
  }

  /**
   * Get course detail by username and course slug
   */
  async getCourseByPath(
    username: string,
    courseSlug: string
  ): Promise<CourseByPathResponse> {
    try {
      return await api.get<CourseByPathResponse>(
        publicPathEndpoints.getCourseByPath(username, courseSlug)
      );
    } catch (error) {
      logger.error("Error fetching course by path:", error);
      throw error;
    }
  }

  /**
   * Get lesson by path (username + course slug + lesson slug)
   */
  async getLessonByPath(
    username: string,
    courseSlug: string,
    lessonSlug: string
  ): Promise<LessonByPathResponse> {
    try {
      return await api.get<LessonByPathResponse>(
        publicPathEndpoints.getLessonByPath(username, courseSlug, lessonSlug)
      );
    } catch (error) {
      logger.error("Error fetching lesson by path:", error);
      throw error;
    }
  }
}

export const publicPathAPI = new PublicPathAPI();
export default publicPathAPI;
