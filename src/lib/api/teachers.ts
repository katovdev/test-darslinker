import { api } from "./client";
import { teacherPublicEndpoints } from "./config";
import { logger } from "../logger";

export interface TeacherPageSettings {
  bannerUrl: string | null;
  tagline: string | null;
  aboutText: string | null;
  telegramUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  websiteUrl: string | null;
  showCoursesCount: boolean;
  showStudentsCount: boolean;
  showRating: boolean;
}

export interface TeacherPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  logoUrl: string | null;
  businessName: string | null;
  specialization: string | null;
  settings: TeacherPageSettings | null;
}

export interface TeacherCourse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  type: string;
  thumbnail: string | null;
  createdAt: string;
  modulesCount: number;
  lessonsCount: number;
  totalDuration: number;
  averageRating: number;
  totalReviews: number;
  enrollmentsCount: number;
}

export interface TeacherStats {
  coursesCount: number;
  studentsCount: number;
  overallRating: number;
  totalReviews: number;
}

export interface TeacherProfileResponse {
  success: boolean;
  data: {
    teacher: TeacherPublicProfile;
    stats: TeacherStats;
    courses: TeacherCourse[];
  };
}

class TeacherPublicAPI {
  async getProfile(id: string): Promise<TeacherProfileResponse> {
    try {
      return await api.get<TeacherProfileResponse>(
        teacherPublicEndpoints.profile(id)
      );
    } catch (error) {
      logger.error("Error fetching teacher profile:", error);
      throw error;
    }
  }
}

export const teacherPublicAPI = new TeacherPublicAPI();
export default teacherPublicAPI;
