import { api } from "./client";
import { courseEndpoints, globalCoursesEndpoint } from "./config";
import { logger } from "../logger";

// Types
export interface Teacher {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  type: "video" | "quiz" | "assignment" | "file" | "reading";
  videoUrl?: string;
  fileUrl?: string;
  assignmentFile?: string;
  instructions?: string;
  duration?: string;
  order: number;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export interface Module {
  _id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  teacher: Teacher;
  modules: Module[];
  price?: number;
  currency?: string;
  status: "draft" | "published" | "archived";
  totalLessons?: number;
  totalDuration?: string;
  enrolledCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseProgress {
  _id: string;
  studentId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson?: string;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
  updatedAt: string;
}

export interface EnrolledCourse extends Course {
  progress?: CourseProgress;
  enrolledAt: string;
}

export interface QuizQuestion {
  _id: string;
  question: string;
  options?: string[];
  answers?: { text: string; isCorrect: boolean }[];
  correctAnswer?: number;
  timeLimit?: number;
}

export interface Quiz {
  _id: string;
  lessonId: string;
  title?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  maxAttempts?: number;
}

export interface QuizAttempt {
  _id: string;
  lessonId: string;
  studentId: string;
  score: number;
  totalQuestions: number;
  answers: {
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
  timeElapsed: number;
  createdAt: string;
}

export interface TeacherLanding {
  _id: string;
  teacherId: string;
  logoText?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  heroTitle?: string;
  heroSubtitle?: string;
}

// Global public courses types
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

// Response types
export interface CoursesResponse {
  success: boolean;
  data: Course[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CourseResponse {
  success: boolean;
  data: Course;
}

export interface EnrolledCoursesResponse {
  success: boolean;
  data: EnrolledCourse[];
}

export interface ProgressResponse {
  success: boolean;
  data: CourseProgress;
}

export interface LessonResponse {
  success: boolean;
  data: Lesson;
}

export interface QuizResponse {
  success: boolean;
  data: Quiz;
}

export interface QuizAttemptsResponse {
  success: boolean;
  data: QuizAttempt[];
}

export interface QuizSubmitResponse {
  success: boolean;
  data: {
    score: number;
    totalQuestions: number;
    passed: boolean;
    attempt: QuizAttempt;
  };
}

export interface TeacherLandingResponse {
  success: boolean;
  data: TeacherLanding;
}

export interface CourseQueryParams {
  search?: string;
  category?: string;
  teacherId?: string;
  status?: string;
  limit?: number;
  page?: number;
}

/**
 * Course API Service
 */
class CourseAPI {
  /**
   * Get global public courses (all active + user's enrolled)
   */
  async getGlobalCourses(): Promise<GlobalCoursesResponse> {
    try {
      return await api.get<GlobalCoursesResponse>(globalCoursesEndpoint);
    } catch (error) {
      logger.error("Error fetching global courses:", error);
      throw error;
    }
  }

  /**
   * Get all published courses
   */
  async getAllCourses(
    params: CourseQueryParams = {}
  ): Promise<CoursesResponse> {
    try {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = queryString
        ? `${courseEndpoints.getAllCourses}?${queryString}`
        : courseEndpoints.getAllCourses;

      return await api.get<CoursesResponse>(url);
    } catch (error) {
      logger.error("Error fetching courses:", error);
      throw error;
    }
  }

  /**
   * Get course by ID
   */
  async getCourseById(id: string): Promise<CourseResponse> {
    try {
      return await api.get<CourseResponse>(courseEndpoints.getCourseById(id));
    } catch (error) {
      logger.error("Error fetching course:", error);
      throw error;
    }
  }

  /**
   * Get enrolled courses for current student
   */
  async getEnrolledCourses(): Promise<EnrolledCoursesResponse> {
    try {
      return await api.get<EnrolledCoursesResponse>(
        courseEndpoints.getEnrolledCourses
      );
    } catch (error) {
      logger.error("Error fetching enrolled courses:", error);
      throw error;
    }
  }

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<{ success: boolean }> {
    try {
      return await api.post(courseEndpoints.enrollInCourse(courseId));
    } catch (error) {
      logger.error("Error enrolling in course:", error);
      throw error;
    }
  }

  /**
   * Get course progress
   */
  async getCourseProgress(courseId: string): Promise<ProgressResponse> {
    try {
      return await api.get<ProgressResponse>(
        courseEndpoints.getCourseProgress(courseId)
      );
    } catch (error) {
      logger.error("Error fetching course progress:", error);
      throw error;
    }
  }

  /**
   * Get lesson by ID
   */
  async getLessonById(
    courseId: string,
    lessonId: string
  ): Promise<LessonResponse> {
    try {
      return await api.get<LessonResponse>(
        courseEndpoints.getLessonById(courseId, lessonId)
      );
    } catch (error) {
      logger.error("Error fetching lesson:", error);
      throw error;
    }
  }

  /**
   * Mark lesson as completed
   */
  async completeLesson(
    courseId: string,
    lessonId: string
  ): Promise<{ success: boolean }> {
    try {
      return await api.post(courseEndpoints.completeLesson(courseId, lessonId));
    } catch (error) {
      logger.error("Error completing lesson:", error);
      throw error;
    }
  }

  /**
   * Get quiz for a lesson
   */
  async getQuiz(lessonId: string): Promise<QuizResponse> {
    try {
      return await api.get<QuizResponse>(courseEndpoints.getQuiz(lessonId));
    } catch (error) {
      logger.error("Error fetching quiz:", error);
      throw error;
    }
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(
    lessonId: string,
    answers: { questionIndex: number; selectedAnswer: number }[],
    timeElapsed: number
  ): Promise<QuizSubmitResponse> {
    try {
      return await api.post<QuizSubmitResponse>(
        courseEndpoints.submitQuiz(lessonId),
        {
          answers,
          timeElapsed,
        }
      );
    } catch (error) {
      logger.error("Error submitting quiz:", error);
      throw error;
    }
  }

  /**
   * Get quiz attempts for a student
   */
  async getQuizAttempts(
    studentId: string,
    lessonId: string
  ): Promise<QuizAttemptsResponse> {
    try {
      return await api.get<QuizAttemptsResponse>(
        courseEndpoints.getQuizAttempts(studentId, lessonId)
      );
    } catch (error) {
      logger.error("Error fetching quiz attempts:", error);
      throw error;
    }
  }

  /**
   * Get teacher landing page settings
   */
  async getTeacherLanding(identifier: string): Promise<TeacherLandingResponse> {
    try {
      return await api.get<TeacherLandingResponse>(
        courseEndpoints.getTeacherLanding(identifier)
      );
    } catch (error) {
      logger.error("Error fetching teacher landing:", error);
      throw error;
    }
  }

  /**
   * Get teacher's courses
   */
  async getTeacherCourses(identifier: string): Promise<CoursesResponse> {
    try {
      return await api.get<CoursesResponse>(
        courseEndpoints.getTeacherCourses(identifier)
      );
    } catch (error) {
      logger.error("Error fetching teacher courses:", error);
      throw error;
    }
  }
}

export const courseAPI = new CourseAPI();
export default courseAPI;
