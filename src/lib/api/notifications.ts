import { api } from "./client";
import { notificationEndpoints } from "./config";
import { logger } from "../logger";

// Types
export type NotificationType =
  | "assignment_graded"
  | "payment_approved"
  | "payment_submitted"
  | "course_enrolled"
  | "lesson_completed"
  | "quiz_passed"
  | "certificate_ready"
  | "general";

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}

// Response types
export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationResponse {
  success: boolean;
  data: Notification;
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export interface NotificationQueryParams {
  read?: boolean;
  type?: NotificationType;
  limit?: number;
  page?: number;
}

/**
 * Notification API Service
 */
class NotificationAPI {
  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    params: NotificationQueryParams = {}
  ): Promise<NotificationsResponse> {
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("userType", "Student");

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      const url = `${notificationEndpoints.getNotifications(userId)}?${queryString}`;

      return await api.get<NotificationsResponse>(url);
    } catch (error) {
      logger.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    try {
      return await api.patch<NotificationResponse>(
        notificationEndpoints.markAsRead(notificationId)
      );
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    try {
      return await api.patch(notificationEndpoints.markAllAsRead(userId));
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<UnreadCountResponse> {
    try {
      return await api.get<UnreadCountResponse>(
        notificationEndpoints.getUnreadCount(userId)
      );
    } catch (error) {
      logger.error("Error fetching unread count:", error);
      throw error;
    }
  }
}

export const notificationAPI = new NotificationAPI();
export default notificationAPI;
