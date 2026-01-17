/**
 * Teacher API Module
 * Handles teacher-specific endpoints (requires teacher role)
 */

import { api } from "./client";
import { teacherEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface TeacherDashboard {
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  pendingPayments: number;
  recentEnrollments: {
    id: string;
    studentName: string;
    courseName: string;
    enrolledAt: string;
  }[];
  recentPayments: {
    id: string;
    studentName: string;
    amount: number;
    status: "pending" | "approved" | "rejected";
    createdAt: string;
  }[];
  courseStats: {
    courseId: string;
    courseName: string;
    enrolledCount: number;
    completionRate: number;
  }[];
}

export interface TeacherProfile {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  businessName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  socialLinks: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTeacherProfileRequest {
  firstName?: string;
  lastName?: string;
  businessName?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
}

export interface TeacherBranding {
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string | null;
}

export interface UpdateBrandingRequest {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface TeacherStudent {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  enrollments: {
    courseId: string;
    courseName: string;
    enrolledAt: string;
    progress: number;
  }[];
  totalPayments: number;
  lastActiveAt: string | null;
}

export interface TeacherCourse {
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
  createdAt: string;
  updatedAt: string;
}

export interface TeacherCourseDetail extends TeacherCourse {
  modules: TeacherModule[];
}

export interface CreateCourseRequest {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  slug?: string;
  description?: string;
  thumbnailUrl?: string;
  price?: number;
  currency?: string;
}

export interface TeacherModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessonCount: number;
  lessons: TeacherLesson[];
}

export interface CreateModuleRequest {
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface UpdateModuleRequest {
  title?: string;
  slug?: string;
  description?: string;
  order?: number;
}

export interface TeacherLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "video" | "text" | "quiz" | "assignment";
  order: number;
  duration: number | null;
  isFree: boolean;
}

export interface TeacherLessonDetail extends TeacherLesson {
  content: string | null;
  videoUrl: string | null;
  attachments: {
    name: string;
    url: string;
    size: number;
  }[];
  quiz: {
    id: string;
    questions: {
      id: string;
      question: string;
      options: string[];
      correctAnswer: number;
    }[];
    timeLimit: number | null;
    passingScore: number;
  } | null;
}

export interface CreateLessonRequest {
  moduleId: string;
  title: string;
  slug: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface UpdateLessonRequest {
  title?: string;
  slug?: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  content?: string;
  videoUrl?: string;
  duration?: number;
  isFree?: boolean;
  order?: number;
}

export interface TeacherPayment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  student: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  course: {
    id: string;
    title: string;
  };
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
}

export interface TeacherStats {
  totalRevenue: number;
  monthlyRevenue: number;
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  publishedCourses: number;
  completionRate: number;
  averageRating: number | null;
}

// Response types
export interface DashboardResponse {
  success: boolean;
  data: TeacherDashboard;
}

export interface TeacherProfileResponse {
  success: boolean;
  data: TeacherProfile;
}

export interface BrandingResponse {
  success: boolean;
  data: TeacherBranding;
}

export interface StudentsResponse {
  success: boolean;
  data: TeacherStudent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StudentResponse {
  success: boolean;
  data: TeacherStudent;
}

export interface CoursesResponse {
  success: boolean;
  data: TeacherCourse[];
}

export interface CourseResponse {
  success: boolean;
  data: TeacherCourseDetail;
}

export interface ModuleResponse {
  success: boolean;
  data: TeacherModule;
}

export interface LessonResponse {
  success: boolean;
  data: TeacherLessonDetail;
}

export interface PaymentsResponse {
  success: boolean;
  data: TeacherPayment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentResponse {
  success: boolean;
  data: TeacherPayment;
}

export interface StatsResponse {
  success: boolean;
  data: TeacherStats;
}

export interface ReorderRequest {
  items: { id: string; order: number }[];
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Teacher API Service
 * For teacher-specific operations
 */
class TeacherAPI {
  // -------------------------------------------------------------------------
  // Dashboard & Profile
  // -------------------------------------------------------------------------

  /**
   * Get teacher dashboard data
   */
  async getDashboard(): Promise<DashboardResponse> {
    try {
      return await api.get<DashboardResponse>(teacherEndpoints.dashboard);
    } catch (error) {
      logger.error("Error fetching teacher dashboard:", error);
      throw error;
    }
  }

  /**
   * Get teacher profile
   */
  async getProfile(): Promise<TeacherProfileResponse> {
    try {
      return await api.get<TeacherProfileResponse>(teacherEndpoints.profile);
    } catch (error) {
      logger.error("Error fetching teacher profile:", error);
      throw error;
    }
  }

  /**
   * Update teacher profile
   */
  async updateProfile(
    data: UpdateTeacherProfileRequest
  ): Promise<TeacherProfileResponse> {
    try {
      return await api.put<TeacherProfileResponse>(
        teacherEndpoints.updateProfile,
        data
      );
    } catch (error) {
      logger.error("Error updating teacher profile:", error);
      throw error;
    }
  }

  /**
   * Get branding settings
   */
  async getBranding(): Promise<BrandingResponse> {
    try {
      return await api.get<BrandingResponse>(teacherEndpoints.branding);
    } catch (error) {
      logger.error("Error fetching branding:", error);
      throw error;
    }
  }

  /**
   * Update branding settings
   */
  async updateBranding(data: UpdateBrandingRequest): Promise<BrandingResponse> {
    try {
      return await api.put<BrandingResponse>(
        teacherEndpoints.updateBranding,
        data
      );
    } catch (error) {
      logger.error("Error updating branding:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Students
  // -------------------------------------------------------------------------

  /**
   * Get all students enrolled in teacher's courses
   */
  async getStudents(params?: {
    search?: string;
    courseId?: string;
    limit?: number;
    page?: number;
  }): Promise<StudentsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${teacherEndpoints.students}?${queryString}`
        : teacherEndpoints.students;

      return await api.get<StudentsResponse>(url);
    } catch (error) {
      logger.error("Error fetching students:", error);
      throw error;
    }
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string): Promise<StudentResponse> {
    try {
      return await api.get<StudentResponse>(teacherEndpoints.studentById(id));
    } catch (error) {
      logger.error("Error fetching student:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Courses
  // -------------------------------------------------------------------------

  /**
   * Get all courses for current teacher
   */
  async getCourses(): Promise<CoursesResponse> {
    try {
      return await api.get<CoursesResponse>(teacherEndpoints.courses);
    } catch (error) {
      logger.error("Error fetching teacher courses:", error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CourseResponse> {
    try {
      return await api.get<CourseResponse>(teacherEndpoints.courseById(id));
    } catch (error) {
      logger.error("Error fetching course:", error);
      throw error;
    }
  }

  /**
   * Create a new course
   */
  async createCourse(data: CreateCourseRequest): Promise<CourseResponse> {
    try {
      return await api.post<CourseResponse>(teacherEndpoints.createCourse, data);
    } catch (error) {
      logger.error("Error creating course:", error);
      throw error;
    }
  }

  /**
   * Update a course
   */
  async updateCourse(
    id: string,
    data: UpdateCourseRequest
  ): Promise<CourseResponse> {
    try {
      return await api.put<CourseResponse>(
        teacherEndpoints.updateCourse(id),
        data
      );
    } catch (error) {
      logger.error("Error updating course:", error);
      throw error;
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<{ success: boolean }> {
    try {
      return await api.delete(teacherEndpoints.deleteCourse(id));
    } catch (error) {
      logger.error("Error deleting course:", error);
      throw error;
    }
  }

  /**
   * Publish a course
   */
  async publishCourse(id: string): Promise<CourseResponse> {
    try {
      return await api.post<CourseResponse>(teacherEndpoints.publishCourse(id));
    } catch (error) {
      logger.error("Error publishing course:", error);
      throw error;
    }
  }

  /**
   * Unpublish a course
   */
  async unpublishCourse(id: string): Promise<CourseResponse> {
    try {
      return await api.post<CourseResponse>(
        teacherEndpoints.unpublishCourse(id)
      );
    } catch (error) {
      logger.error("Error unpublishing course:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Modules
  // -------------------------------------------------------------------------

  /**
   * Get module by ID
   */
  async getModuleById(id: string): Promise<ModuleResponse> {
    try {
      return await api.get<ModuleResponse>(teacherEndpoints.moduleById(id));
    } catch (error) {
      logger.error("Error fetching module:", error);
      throw error;
    }
  }

  /**
   * Create a new module
   */
  async createModule(data: CreateModuleRequest): Promise<ModuleResponse> {
    try {
      return await api.post<ModuleResponse>(
        teacherEndpoints.createModule,
        data
      );
    } catch (error) {
      logger.error("Error creating module:", error);
      throw error;
    }
  }

  /**
   * Update a module
   */
  async updateModule(
    id: string,
    data: UpdateModuleRequest
  ): Promise<ModuleResponse> {
    try {
      return await api.put<ModuleResponse>(
        teacherEndpoints.updateModule(id),
        data
      );
    } catch (error) {
      logger.error("Error updating module:", error);
      throw error;
    }
  }

  /**
   * Delete a module
   */
  async deleteModule(id: string): Promise<{ success: boolean }> {
    try {
      return await api.delete(teacherEndpoints.deleteModule(id));
    } catch (error) {
      logger.error("Error deleting module:", error);
      throw error;
    }
  }

  /**
   * Reorder modules within a course
   */
  async reorderModules(
    courseId: string,
    data: ReorderRequest
  ): Promise<{ success: boolean }> {
    try {
      return await api.put(teacherEndpoints.reorderModules(courseId), data);
    } catch (error) {
      logger.error("Error reordering modules:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------------------

  /**
   * Get lesson by ID
   */
  async getLessonById(id: string): Promise<LessonResponse> {
    try {
      return await api.get<LessonResponse>(teacherEndpoints.lessonById(id));
    } catch (error) {
      logger.error("Error fetching lesson:", error);
      throw error;
    }
  }

  /**
   * Create a new lesson
   */
  async createLesson(data: CreateLessonRequest): Promise<LessonResponse> {
    try {
      return await api.post<LessonResponse>(
        teacherEndpoints.createLesson,
        data
      );
    } catch (error) {
      logger.error("Error creating lesson:", error);
      throw error;
    }
  }

  /**
   * Update a lesson
   */
  async updateLesson(
    id: string,
    data: UpdateLessonRequest
  ): Promise<LessonResponse> {
    try {
      return await api.put<LessonResponse>(
        teacherEndpoints.updateLesson(id),
        data
      );
    } catch (error) {
      logger.error("Error updating lesson:", error);
      throw error;
    }
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(id: string): Promise<{ success: boolean }> {
    try {
      return await api.delete(teacherEndpoints.deleteLesson(id));
    } catch (error) {
      logger.error("Error deleting lesson:", error);
      throw error;
    }
  }

  /**
   * Reorder lessons within a module
   */
  async reorderLessons(
    moduleId: string,
    data: ReorderRequest
  ): Promise<{ success: boolean }> {
    try {
      return await api.put(teacherEndpoints.reorderLessons(moduleId), data);
    } catch (error) {
      logger.error("Error reordering lessons:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------------

  /**
   * Get all payments
   */
  async getPayments(params?: {
    status?: "pending" | "approved" | "rejected";
    courseId?: string;
    limit?: number;
    page?: number;
  }): Promise<PaymentsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${teacherEndpoints.payments}?${queryString}`
        : teacherEndpoints.payments;

      return await api.get<PaymentsResponse>(url);
    } catch (error) {
      logger.error("Error fetching payments:", error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentResponse> {
    try {
      return await api.get<PaymentResponse>(teacherEndpoints.paymentById(id));
    } catch (error) {
      logger.error("Error fetching payment:", error);
      throw error;
    }
  }

  /**
   * Approve a payment
   */
  async approvePayment(id: string): Promise<PaymentResponse> {
    try {
      return await api.post<PaymentResponse>(
        teacherEndpoints.approvePayment(id)
      );
    } catch (error) {
      logger.error("Error approving payment:", error);
      throw error;
    }
  }

  /**
   * Reject a payment
   */
  async rejectPayment(
    id: string,
    reason?: string
  ): Promise<PaymentResponse> {
    try {
      return await api.post<PaymentResponse>(
        teacherEndpoints.rejectPayment(id),
        { reason }
      );
    } catch (error) {
      logger.error("Error rejecting payment:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Stats
  // -------------------------------------------------------------------------

  /**
   * Get teacher statistics
   */
  async getStats(): Promise<StatsResponse> {
    try {
      return await api.get<StatsResponse>(teacherEndpoints.stats);
    } catch (error) {
      logger.error("Error fetching stats:", error);
      throw error;
    }
  }
}

export const teacherAPI = new TeacherAPI();
export default teacherAPI;
