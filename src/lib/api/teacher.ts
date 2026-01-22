import { api } from "./client";
import { teacherEndpoints } from "./config";

export interface TeacherStats {
  courses: {
    total: number;
    active: number;
    draft: number;
  };
  students: {
    total: number;
  };
  payments: {
    total: number;
    pending: number;
    approved: number;
  };
  earnings: {
    total: number;
    currentBalance: number;
  };
}

export interface TeacherStudent {
  id: string;
  enrolledAt: string;
  completedAt: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    username: string | null;
    avatar: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface TeacherPayment {
  id: string;
  amount: number;
  checkImageUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  approvedAt: string | null;
  createdAt: string;
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
}

export interface TeacherEarnings {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
    businessName: string | null;
  };
  currentBalance: number;
  totalEarnings: number;
  coursesCount: number;
  studentsCount: number;
  earningsByCourse: Array<{
    course: {
      id: string;
      title: string;
      slug: string;
    };
    totalAmount: number;
    paymentsCount: number;
  }>;
}

export interface TeacherCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  type: "free" | "paid";
  price: number;
  status: "draft" | "active" | "approved" | "archived";
  createdAt: string;
  modulesCount: number;
  enrollmentsCount: number;
  paymentsCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ListStudentsParams {
  page?: number;
  limit?: number;
  courseId?: string;
  search?: string;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  courseId?: string;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  status?: "draft" | "active" | "approved" | "archived";
  search?: string;
}

export interface CreateCourseInput {
  title: string;
  description: string;
  slug?: string;
  thumbnail?: string | null;
  type: "free" | "paid";
  price?: number;
  status?: "draft" | "active";
}

export interface UpdateCourseInput {
  title?: string;
  description?: string;
  slug?: string;
  thumbnail?: string | null;
  type?: "free" | "paid";
  price?: number;
  status?: "draft" | "active";
}

export interface TeacherCourseDetail extends TeacherCourse {
  modules: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    order: number;
    lessonsCount: number;
  }>;
}

export interface UpdateProfileDto {
  bio?: string;
  city?: string;
  country?: string;
  specialization?: string;
  businessName?: string;
  customUrl?: string;
}

export interface QuizAnalyticsResult {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  quizTitle: string;
  attemptNumber: number;
  score: number;
  passed: boolean;
  timeTaken: number;
  submittedAt: string;
}

export interface QuizAnalytics {
  totalAttempts: number;
  studentCount: number;
  avgScore: number;
  passRate: number;
  results: QuizAnalyticsResult[];
}

export interface StudentAnalytics {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourses: Array<{
    courseId: string;
    courseTitle: string;
    enrolledAt: string;
    progress: number;
    status: string;
  }>;
  avgProgress: number;
  isActive: boolean;
  joinedAt: string;
}

export const teacherApi = {
  getStats: () => api.get<SingleResponse<TeacherStats>>(teacherEndpoints.stats),

  listStudents: (params?: ListStudentsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { students: TeacherStudent[]; pagination: Pagination };
    }>(`${teacherEndpoints.students}${query ? `?${query}` : ""}`);
  },

  listPayments: (params?: ListPaymentsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { payments: TeacherPayment[]; pagination: Pagination };
    }>(`${teacherEndpoints.payments}${query ? `?${query}` : ""}`);
  },

  getEarnings: () =>
    api.get<SingleResponse<TeacherEarnings>>(teacherEndpoints.earnings),

  listCourses: (params?: ListCoursesParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { courses: TeacherCourse[]; pagination: Pagination };
    }>(`${teacherEndpoints.courses}${query ? `?${query}` : ""}`);
  },

  approvePayment: (paymentId: string) =>
    api.put<SingleResponse<TeacherPayment>>(
      teacherEndpoints.approvePayment(paymentId)
    ),

  rejectPayment: (paymentId: string, reason: string) =>
    api.put<SingleResponse<TeacherPayment>>(
      teacherEndpoints.rejectPayment(paymentId),
      { reason }
    ),

  // Course CRUD
  getCourse: (courseId: string) =>
    api.get<SingleResponse<TeacherCourseDetail>>(
      teacherEndpoints.courseById(courseId)
    ),

  createCourse: (input: CreateCourseInput) =>
    api.post<SingleResponse<TeacherCourse>>(teacherEndpoints.courses, input),

  updateCourse: (courseId: string, input: UpdateCourseInput) =>
    api.put<SingleResponse<TeacherCourse>>(
      teacherEndpoints.courseById(courseId),
      input
    ),

  deleteCourse: (courseId: string) =>
    api.delete<{ success: boolean; message: string }>(
      teacherEndpoints.courseById(courseId)
    ),

  // Profile Management
  updateProfile: (data: UpdateProfileDto) =>
    api.put<SingleResponse<{ id: string }>>("/teacher/profile", data),

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post<SingleResponse<{ avatarUrl: string }>>(
      "/teacher/profile/avatar",
      formData
    );
  },

  deleteAvatar: () =>
    api.delete<{ success: boolean; message: string }>(
      "/teacher/profile/avatar"
    ),

  // Analytics
  getQuizAnalytics: () =>
    api.get<SingleResponse<QuizAnalytics>>("/teacher/analytics/quizzes"),

  getStudentAnalytics: () =>
    api.get<SingleResponse<StudentAnalytics[]>>("/teacher/analytics/students"),

  // Reviews
  getAllReviews: () =>
    api.get<
      SingleResponse<{
        avgRating: number;
        total: number;
        pendingResponses: number;
        data: Array<{
          id: string;
          rating: number;
          comment: string;
          teacherResponse?: string;
          student: {
            id: string;
            name: string;
            avatar?: string;
          };
          course: {
            id: string;
            title: string;
          };
          createdAt: string;
        }>;
      }>
    >("/teacher/reviews"),
};

export default teacherApi;
