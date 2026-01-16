import { api } from "./client";
import { landingEndpoints } from "./config";
import { logger } from "../logger";

// Types
export interface TeacherProfile {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  specialization?: string;
  location?: string;
  experience?: string;
  rating?: number;
  totalStudents?: number;
}

export interface LandingSettings {
  _id?: string;
  teacherId: string;
  logoText?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  aboutText?: string;
  customUrl?: string;
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
  };
  certificates?: {
    title: string;
    organization: string;
    year: string;
    image?: string;
  }[];
  testimonials?: {
    name: string;
    text: string;
    rating: number;
    avatar?: string;
  }[];
}

export interface TeacherCourse {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  currency?: string;
  status: "draft" | "published" | "archived";
  totalLessons?: number;
  totalDuration?: string;
  enrolledCount?: number;
  rating?: number;
}

export interface PublicLandingResponse {
  success: boolean;
  teacher?: TeacherProfile;
  landing?: LandingSettings;
  courses?: TeacherCourse[];
  message?: string;
}

export interface TeacherCoursesResponse {
  success: boolean;
  data: TeacherCourse[];
}

/**
 * Landing Page API Service (Public endpoints - no auth required)
 */
class LandingAPI {
  /**
   * Get public landing page data for a teacher
   * @param identifier - Teacher ID or custom URL
   */
  async getPublicLanding(identifier: string): Promise<PublicLandingResponse> {
    try {
      // Use fetch directly for public endpoints (no auth token)
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
      const response = await fetch(
        `${baseUrl}${landingEndpoints.getPublicLanding(identifier)}`
      );
      return await response.json();
    } catch (error) {
      logger.error("Error fetching public landing:", error);
      throw error;
    }
  }

  /**
   * Get teacher's courses (public)
   * @param identifier - Teacher ID or custom URL
   */
  async getTeacherCourses(identifier: string): Promise<TeacherCoursesResponse> {
    try {
      return await api.get<TeacherCoursesResponse>(
        landingEndpoints.getTeacherCourses(identifier)
      );
    } catch (error) {
      logger.error("Error fetching teacher courses:", error);
      throw error;
    }
  }
}

export const landingAPI = new LandingAPI();
export default landingAPI;
