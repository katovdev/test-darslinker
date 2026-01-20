import { api } from "./client";
import { coursesEndpoint } from "./config";
import { logger } from "../logger";

// Types for global courses (per TODO.md)
export interface GlobalCourseTeacher {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  logoUrl: string | null;
}

export interface GlobalCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  type: string;
  thumbnail: string | null;
  createdAt: string;
  teacher: GlobalCourseTeacher;
  modulesCount: number;
  lessonsCount: number;
  totalDuration: number;
}

export interface GlobalCoursesResponse {
  success: boolean;
  data: {
    all: GlobalCourse[];
    enrolled: GlobalCourse[];
  };
}

/**
 * Course API Service
 * Per TODO.md: GET /api/courses returns { all: [], enrolled: [] }
 */
class CourseAPI {
  /**
   * Get all courses and enrolled courses for the current user
   */
  async getCourses(): Promise<GlobalCoursesResponse> {
    try {
      return await api.get<GlobalCoursesResponse>(coursesEndpoint);
    } catch (error) {
      logger.error("Error fetching courses:", error);
      throw error;
    }
  }
}

export const courseAPI = new CourseAPI();
export default courseAPI;
