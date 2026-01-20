import { api } from "./client";
import { moderatorEndpoints } from "./config";

export interface ModeratorStats {
  users: {
    total: number;
    teachers: number;
    students: number;
    pending: number;
    blocked: number;
  };
  courses: {
    total: number;
    active: number;
    draft: number;
  };
}

export interface ModeratorUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "teacher" | "student" | "moderator" | "admin";
  status: "pending" | "active" | "blocked";
  username: string | null;
  businessName: string | null;
  points: number;
  level: number;
  createdAt: string;
  coursesCount: number;
  enrollmentsCount: number;
  studentsCount: number;
}

export interface ModeratorUserDetail extends ModeratorUser {
  logoUrl: string | null;
  primaryColor: string | null;
  specialization: string | null;
  teacherId: string | null;
  updatedAt: string;
}

export interface ModeratorCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  type: "free" | "paid";
  price: number;
  status: "draft" | "active" | "archived";
  createdAt: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    username: string | null;
  };
  modulesCount: number;
  enrollmentsCount: number;
}

export interface ModeratorCourseDetail extends ModeratorCourse {
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
  status?: "draft" | "active" | "archived";
  type?: "free" | "paid";
  teacherId?: string;
  search?: string;
}

export interface UpdateUserStatusInput {
  status: "pending" | "active" | "blocked";
}

export interface UpdateCourseStatusInput {
  status: "draft" | "active" | "archived";
}

export const moderatorApi = {
  getStats: () =>
    api.get<SingleResponse<ModeratorStats>>(moderatorEndpoints.stats),

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
      data: { users: ModeratorUser[]; pagination: Pagination };
    }>(`${moderatorEndpoints.users}${query ? `?${query}` : ""}`);
  },

  getUser: (id: string) =>
    api.get<SingleResponse<ModeratorUserDetail>>(
      moderatorEndpoints.userById(id)
    ),

  updateUserStatus: (id: string, input: UpdateUserStatusInput) =>
    api.patch<SingleResponse<ModeratorUser>>(
      moderatorEndpoints.userById(id),
      input
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
      data: { courses: ModeratorCourse[]; pagination: Pagination };
    }>(`${moderatorEndpoints.courses}${query ? `?${query}` : ""}`);
  },

  getCourse: (id: string) =>
    api.get<SingleResponse<ModeratorCourseDetail>>(
      moderatorEndpoints.courseById(id)
    ),

  updateCourseStatus: (id: string, input: UpdateCourseStatusInput) =>
    api.patch<SingleResponse<ModeratorCourse>>(
      moderatorEndpoints.courseById(id),
      input
    ),

  // NOTE: No payments or earnings endpoints for moderators
  // Financial data is restricted to admin only
};

export default moderatorApi;
