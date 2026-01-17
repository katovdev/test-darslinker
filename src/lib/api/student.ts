/**
 * Student API Module
 * Handles student-specific endpoints (requires authentication)
 */

import { api } from "./client";
import { studentEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface StudentProfile {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: "active" | "completed" | "expired";
  enrolledAt: string;
  expiresAt: string | null;
  completedAt: string | null;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
      username: string;
    };
  };
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
}

export interface StudentCourse {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  modules: StudentModule[];
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
  enrollment: {
    id: string;
    status: "active" | "completed" | "expired";
    enrolledAt: string;
  };
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
    currentLessonId: string | null;
  };
}

export interface StudentModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessons: StudentLesson[];
  progress: {
    completedLessons: number;
    totalLessons: number;
  };
}

export interface StudentLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  type: "video" | "text" | "quiz" | "assignment";
  order: number;
  duration: number | null;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface StudentLessonDetail extends StudentLesson {
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
    }[];
    timeLimit: number | null;
    passingScore: number;
  } | null;
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
  nextLesson: {
    id: string;
    slug: string;
    title: string;
  } | null;
  prevLesson: {
    id: string;
    slug: string;
    title: string;
  } | null;
}

export interface StudentProgress {
  totalEnrollments: number;
  completedCourses: number;
  totalLessonsCompleted: number;
  totalTimeSpent: number;
  recentActivity: {
    lessonId: string;
    lessonTitle: string;
    courseId: string;
    courseTitle: string;
    completedAt: string;
  }[];
}

export interface CourseProgress {
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  percentage: number;
  currentLessonId: string | null;
  lastAccessedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "rejected";
  courseId: string;
  courseName: string;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface SubmitPaymentRequest {
  courseId: string;
  amount: number;
  receiptUrl?: string;
  notes?: string;
}

// Response types
export interface ProfileResponse {
  success: boolean;
  data: StudentProfile;
}

export interface EnrollmentsResponse {
  success: boolean;
  data: Enrollment[];
}

export interface StudentCourseResponse {
  success: boolean;
  data: StudentCourse;
}

export interface StudentLessonResponse {
  success: boolean;
  data: StudentLessonDetail;
}

export interface StudentProgressResponse {
  success: boolean;
  data: StudentProgress;
}

export interface CourseProgressResponse {
  success: boolean;
  data: CourseProgress;
}

export interface PaymentsResponse {
  success: boolean;
  data: Payment[];
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
}

export interface EnrollResponse {
  success: boolean;
  data: {
    enrollmentId: string;
    message: string;
  };
}

export interface CompleteLessonResponse {
  success: boolean;
  data: {
    completed: boolean;
    progress: {
      completedLessons: number;
      totalLessons: number;
      percentage: number;
    };
  };
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Student API Service
 * For student-specific operations
 */
class StudentAPI {
  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------

  /**
   * Get current student's profile
   */
  async getProfile(): Promise<ProfileResponse> {
    try {
      return await api.get<ProfileResponse>(studentEndpoints.profile);
    } catch (error) {
      logger.error("Error fetching student profile:", error);
      throw error;
    }
  }

  /**
   * Update current student's profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    try {
      return await api.put<ProfileResponse>(
        studentEndpoints.updateProfile,
        data
      );
    } catch (error) {
      logger.error("Error updating student profile:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Enrollments & Courses
  // -------------------------------------------------------------------------

  /**
   * Get all enrollments for current student
   */
  async getEnrollments(): Promise<EnrollmentsResponse> {
    try {
      return await api.get<EnrollmentsResponse>(studentEndpoints.enrollments);
    } catch (error) {
      logger.error("Error fetching enrollments:", error);
      throw error;
    }
  }

  /**
   * Enroll in a course
   */
  async enroll(courseId: string): Promise<EnrollResponse> {
    try {
      return await api.post<EnrollResponse>(studentEndpoints.enroll(courseId));
    } catch (error) {
      logger.error("Error enrolling in course:", error);
      throw error;
    }
  }

  /**
   * Get course detail with progress (must be enrolled)
   */
  async getCourseById(id: string): Promise<StudentCourseResponse> {
    try {
      return await api.get<StudentCourseResponse>(
        studentEndpoints.courseById(id)
      );
    } catch (error) {
      logger.error("Error fetching student course:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Lessons
  // -------------------------------------------------------------------------

  /**
   * Get lesson detail (must be enrolled in course)
   */
  async getLessonById(id: string): Promise<StudentLessonResponse> {
    try {
      return await api.get<StudentLessonResponse>(
        studentEndpoints.lessonById(id)
      );
    } catch (error) {
      logger.error("Error fetching student lesson:", error);
      throw error;
    }
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(id: string): Promise<CompleteLessonResponse> {
    try {
      return await api.post<CompleteLessonResponse>(
        studentEndpoints.completeLesson(id)
      );
    } catch (error) {
      logger.error("Error completing lesson:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Progress
  // -------------------------------------------------------------------------

  /**
   * Get overall student progress
   */
  async getProgress(): Promise<StudentProgressResponse> {
    try {
      return await api.get<StudentProgressResponse>(studentEndpoints.progress);
    } catch (error) {
      logger.error("Error fetching student progress:", error);
      throw error;
    }
  }

  /**
   * Get progress for a specific course
   */
  async getCourseProgress(courseId: string): Promise<CourseProgressResponse> {
    try {
      return await api.get<CourseProgressResponse>(
        studentEndpoints.courseProgress(courseId)
      );
    } catch (error) {
      logger.error("Error fetching course progress:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Payments
  // -------------------------------------------------------------------------

  /**
   * Get all payments for current student
   */
  async getPayments(): Promise<PaymentsResponse> {
    try {
      return await api.get<PaymentsResponse>(studentEndpoints.payments);
    } catch (error) {
      logger.error("Error fetching payments:", error);
      throw error;
    }
  }

  /**
   * Submit a payment for a course
   */
  async submitPayment(data: SubmitPaymentRequest): Promise<PaymentResponse> {
    try {
      return await api.post<PaymentResponse>(
        studentEndpoints.submitPayment,
        data
      );
    } catch (error) {
      logger.error("Error submitting payment:", error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id: string): Promise<PaymentResponse> {
    try {
      return await api.get<PaymentResponse>(studentEndpoints.paymentById(id));
    } catch (error) {
      logger.error("Error fetching payment:", error);
      throw error;
    }
  }
}

export const studentAPI = new StudentAPI();
export default studentAPI;
