/**
 * Admin API Module
 * Handles admin-specific endpoints (requires admin role)
 */

import { api } from "./client";
import { adminEndpoints } from "./config";
import { logger } from "../logger";

// ============================================================================
// Types
// ============================================================================

export interface AdminDashboard {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalRevenue: number;
  pendingRequests: number;
  recentUsers: {
    id: string;
    firstName: string;
    lastName: string;
    role: "student" | "teacher" | "admin";
    createdAt: string;
  }[];
  recentTeachers: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    courseCount: number;
    studentCount: number;
  }[];
}

export interface AdminStats {
  userGrowth: {
    date: string;
    count: number;
  }[];
  revenueGrowth: {
    date: string;
    amount: number;
  }[];
  courseCreation: {
    date: string;
    count: number;
  }[];
  topTeachers: {
    id: string;
    name: string;
    revenue: number;
    students: number;
  }[];
}

export interface AdminTeacher {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  username: string;
  businessName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  status: "active" | "suspended";
  courseCount: number;
  studentCount: number;
  totalRevenue: number;
  createdAt: string;
  lastActiveAt: string | null;
}

export interface TeacherRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
  };
  username: string;
  businessName: string | null;
  bio: string | null;
  socialLinks: {
    telegram?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  } | null;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

export interface AdminUser {
  id: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  avatarUrl: string | null;
  status: "active" | "suspended";
  createdAt: string;
  lastActiveAt: string | null;
  // Additional fields based on role
  teacherProfile?: {
    username: string;
    courseCount: number;
    studentCount: number;
  };
  studentProfile?: {
    enrollmentCount: number;
    completedCourses: number;
  };
}

// Response types
export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboard;
}

export interface AdminStatsResponse {
  success: boolean;
  data: AdminStats;
}

export interface TeachersResponse {
  success: boolean;
  data: AdminTeacher[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeacherResponse {
  success: boolean;
  data: AdminTeacher;
}

export interface TeacherRequestsResponse {
  success: boolean;
  data: TeacherRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TeacherRequestResponse {
  success: boolean;
  data: TeacherRequest;
}

export interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserResponse {
  success: boolean;
  data: AdminUser;
}

// ============================================================================
// API Class
// ============================================================================

/**
 * Admin API Service
 * For admin-specific operations
 */
class AdminAPI {
  // -------------------------------------------------------------------------
  // Dashboard & Stats
  // -------------------------------------------------------------------------

  /**
   * Get admin dashboard data
   */
  async getDashboard(): Promise<AdminDashboardResponse> {
    try {
      return await api.get<AdminDashboardResponse>(adminEndpoints.dashboard);
    } catch (error) {
      logger.error("Error fetching admin dashboard:", error);
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  async getStats(params?: {
    period?: "week" | "month" | "year";
  }): Promise<AdminStatsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.period) {
        searchParams.append("period", params.period);
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${adminEndpoints.stats}?${queryString}`
        : adminEndpoints.stats;

      return await api.get<AdminStatsResponse>(url);
    } catch (error) {
      logger.error("Error fetching admin stats:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Teachers
  // -------------------------------------------------------------------------

  /**
   * Get all teachers
   */
  async getTeachers(params?: {
    search?: string;
    status?: "active" | "suspended";
    limit?: number;
    page?: number;
  }): Promise<TeachersResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${adminEndpoints.teachers}?${queryString}`
        : adminEndpoints.teachers;

      return await api.get<TeachersResponse>(url);
    } catch (error) {
      logger.error("Error fetching teachers:", error);
      throw error;
    }
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(id: string): Promise<TeacherResponse> {
    try {
      return await api.get<TeacherResponse>(adminEndpoints.teacherById(id));
    } catch (error) {
      logger.error("Error fetching teacher:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Teacher Requests
  // -------------------------------------------------------------------------

  /**
   * Get all teacher requests
   */
  async getTeacherRequests(params?: {
    status?: "pending" | "approved" | "rejected";
    limit?: number;
    page?: number;
  }): Promise<TeacherRequestsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${adminEndpoints.teacherRequests}?${queryString}`
        : adminEndpoints.teacherRequests;

      return await api.get<TeacherRequestsResponse>(url);
    } catch (error) {
      logger.error("Error fetching teacher requests:", error);
      throw error;
    }
  }

  /**
   * Get teacher request by ID
   */
  async getTeacherRequestById(id: string): Promise<TeacherRequestResponse> {
    try {
      return await api.get<TeacherRequestResponse>(
        adminEndpoints.teacherRequestById(id)
      );
    } catch (error) {
      logger.error("Error fetching teacher request:", error);
      throw error;
    }
  }

  /**
   * Approve a teacher request
   */
  async approveRequest(id: string): Promise<TeacherRequestResponse> {
    try {
      return await api.post<TeacherRequestResponse>(
        adminEndpoints.approveRequest(id)
      );
    } catch (error) {
      logger.error("Error approving request:", error);
      throw error;
    }
  }

  /**
   * Reject a teacher request
   */
  async rejectRequest(
    id: string,
    reason?: string
  ): Promise<TeacherRequestResponse> {
    try {
      return await api.post<TeacherRequestResponse>(
        adminEndpoints.rejectRequest(id),
        { reason }
      );
    } catch (error) {
      logger.error("Error rejecting request:", error);
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  /**
   * Get all users
   */
  async getUsers(params?: {
    search?: string;
    role?: "student" | "teacher" | "admin";
    status?: "active" | "suspended";
    limit?: number;
    page?: number;
  }): Promise<UsersResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = queryString
        ? `${adminEndpoints.users}?${queryString}`
        : adminEndpoints.users;

      return await api.get<UsersResponse>(url);
    } catch (error) {
      logger.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<UserResponse> {
    try {
      return await api.get<UserResponse>(adminEndpoints.userById(id));
    } catch (error) {
      logger.error("Error fetching user:", error);
      throw error;
    }
  }
}

export const adminAPI = new AdminAPI();
export default adminAPI;
