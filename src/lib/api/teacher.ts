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
};

export default teacherApi;
