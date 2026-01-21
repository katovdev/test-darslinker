import { api } from "./client";
import { adminEndpoints } from "./config";

export interface AdminStats {
  users: {
    total: number;
    teachers: number;
    students: number;
    moderators: number;
  };
  courses: {
    total: number;
    active: number;
  };
  payments: {
    total: number;
    pending: number;
  };
  financial: {
    totalRevenue: number;
    totalTeacherBalance: number;
  };
}

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "teacher" | "student" | "moderator" | "admin";
  status: "pending" | "active" | "blocked";
  username: string | null;
  businessName: string | null;
  balance: number;
  points: number;
  level: number;
  createdAt: string;
  coursesCount: number;
  enrollmentsCount: number;
  studentsCount: number;
}

export interface AdminUserDetail extends AdminUser {
  logoUrl: string | null;
  primaryColor: string | null;
  specialization: string | null;
  teacherId: string | null;
  updatedAt: string;
  paymentsCount: number;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  type: "free" | "paid";
  price: number;
  status: "draft" | "active" | "approved" | "archived";
  createdAt: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
  };
  modulesCount: number;
  enrollmentsCount: number;
  paymentsCount: number;
}

export interface AdminCourseDetail extends Omit<AdminCourse, "paymentsCount"> {
  updatedAt: string;
  modules: Array<{
    id: string;
    title: string;
    order: number;
    lessonsCount: number;
  }>;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
    businessName: string | null;
  };
  paymentsCount: number;
}

export interface AdminPayment {
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
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
    };
  };
}

export interface AdminEarning {
  id: string;
  firstName: string;
  lastName: string;
  username: string | null;
  businessName: string | null;
  currentBalance: number;
  totalEarnings: number;
  coursesCount: number;
  studentsCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[] | Pagination;
  } & { pagination: Pagination };
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: "teacher" | "student" | "moderator" | "admin";
  status?: "pending" | "active" | "blocked";
  search?: string;
}

export interface ListCoursesParams {
  page?: number;
  limit?: number;
  status?: "draft" | "active" | "approved" | "archived";
  type?: "free" | "paid";
  teacherId?: string;
  search?: string;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  status?: "pending" | "approved" | "rejected";
  studentId?: string;
  courseId?: string;
}

export interface ListEarningsParams {
  page?: number;
  limit?: number;
}

export interface UpdateUserInput {
  role?: "teacher" | "student" | "moderator" | "admin";
  status?: "pending" | "active" | "blocked";
  firstName?: string;
  lastName?: string;
}

export interface UpdateCourseStatusInput {
  status: "draft" | "active" | "approved" | "archived";
}

export interface UpdatePaymentInput {
  status: "approved" | "rejected";
  rejectionReason?: string;
}

export interface CreateUserInput {
  id: string; // Telegram ID as string
  phone: string;
  firstName: string;
  lastName: string;
  role: "teacher" | "student" | "moderator" | "admin";
  status?: "pending" | "active" | "blocked";
  username?: string;
  businessName?: string;
  specialization?: string;
}

export interface FullUpdateUserInput {
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: "teacher" | "student" | "moderator" | "admin";
  status?: "pending" | "active" | "blocked";
  username?: string | null;
  businessName?: string | null;
  specialization?: string | null;
  balance?: number;
}

export interface CreateCourseInput {
  teacherId: string;
  title: string;
  slug?: string;
  description: string;
  thumbnail?: string;
  type?: "free" | "paid";
  price?: number;
  status?: "draft" | "active" | "approved" | "archived";
}

export interface FullUpdateCourseInput {
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: string | null;
  type?: "free" | "paid";
  price?: number;
  status?: "draft" | "active" | "approved" | "archived";
}

export const adminApi = {
  getStats: () => api.get<SingleResponse<AdminStats>>(adminEndpoints.stats),

  listUsers: (params?: ListUsersParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.role) searchParams.set("role", params.role);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { users: AdminUser[]; pagination: Pagination };
    }>(`${adminEndpoints.users}${query ? `?${query}` : ""}`);
  },

  getUser: (id: string) =>
    api.get<SingleResponse<AdminUserDetail>>(adminEndpoints.userById(id)),

  createUser: (input: CreateUserInput) =>
    api.post<SingleResponse<AdminUser>>(adminEndpoints.users, input),

  updateUser: (id: string, input: UpdateUserInput) =>
    api.patch<SingleResponse<AdminUser>>(adminEndpoints.userById(id), input),

  fullUpdateUser: (id: string, input: FullUpdateUserInput) =>
    api.put<SingleResponse<AdminUser>>(adminEndpoints.userById(id), input),

  deleteUser: (id: string) =>
    api.delete<SingleResponse<{ deleted: boolean }>>(
      adminEndpoints.userById(id)
    ),

  listCourses: (params?: ListCoursesParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.teacherId) searchParams.set("teacherId", params.teacherId);
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { courses: AdminCourse[]; pagination: Pagination };
    }>(`${adminEndpoints.courses}${query ? `?${query}` : ""}`);
  },

  createCourse: (input: CreateCourseInput) =>
    api.post<SingleResponse<AdminCourse>>(adminEndpoints.courses, input),

  getCourse: (id: string) =>
    api.get<SingleResponse<AdminCourseDetail>>(adminEndpoints.courseById(id)),

  updateCourseStatus: (id: string, input: UpdateCourseStatusInput) =>
    api.patch<SingleResponse<AdminCourse>>(
      adminEndpoints.courseById(id),
      input
    ),

  fullUpdateCourse: (id: string, input: FullUpdateCourseInput) =>
    api.put<SingleResponse<AdminCourse>>(adminEndpoints.courseById(id), input),

  deleteCourse: (id: string) =>
    api.delete<SingleResponse<{ deleted: boolean }>>(
      adminEndpoints.courseById(id)
    ),

  listPayments: (params?: ListPaymentsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.studentId) searchParams.set("studentId", params.studentId);
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { payments: AdminPayment[]; pagination: Pagination };
    }>(`${adminEndpoints.payments}${query ? `?${query}` : ""}`);
  },

  getPayment: (id: string) =>
    api.get<SingleResponse<AdminPayment>>(adminEndpoints.paymentById(id)),

  updatePayment: (id: string, input: UpdatePaymentInput) =>
    api.patch<SingleResponse<AdminPayment>>(
      adminEndpoints.paymentById(id),
      input
    ),

  listEarnings: (params?: ListEarningsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { earnings: AdminEarning[]; pagination: Pagination };
    }>(`${adminEndpoints.earnings}${query ? `?${query}` : ""}`);
  },
};

export default adminApi;
