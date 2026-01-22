import { api } from "./client";
import type {
  Notification,
  NotificationPreferences,
  UpdateNotificationPreferencesDto,
  NotificationAnalytics,
} from "@/types/notification";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: string;
}

export const notificationsApi = {
  // List notifications
  list: (params?: ListNotificationsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.read !== undefined)
      searchParams.set("read", params.read.toString());
    if (params?.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return api.get<ListResponse<Notification>>(
      `/notifications${query ? `?${query}` : ""}`
    );
  },

  // Get all notifications (no pagination)
  getAll: () => api.get<SingleResponse<Notification[]>>("/notifications/all"),

  // Get single notification
  get: (notificationId: string) =>
    api.get<SingleResponse<Notification>>(`/notifications/${notificationId}`),

  // Mark as read
  markAsRead: (notificationId: string) =>
    api.patch<SingleResponse<Notification>>(
      `/notifications/${notificationId}/read`
    ),

  // Mark multiple as read
  markManyAsRead: (notificationIds: string[]) =>
    api.patch<{ success: boolean; count: number }>("/notifications/mark-read", {
      notificationIds,
    }),

  // Mark all as read
  markAllAsRead: () =>
    api.patch<{ success: boolean; count: number }>(
      "/notifications/mark-all-read"
    ),

  // Delete notification
  delete: (notificationId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/notifications/${notificationId}`
    ),

  // Delete all read notifications
  deleteAllRead: () =>
    api.delete<{ success: boolean; count: number }>(
      "/notifications/delete-read"
    ),

  // Get unread count
  getUnreadCount: () =>
    api.get<SingleResponse<{ count: number }>>("/notifications/unread-count"),

  // Get analytics
  getAnalytics: () =>
    api.get<SingleResponse<NotificationAnalytics>>("/notifications/analytics"),

  // Preferences
  getPreferences: () =>
    api.get<SingleResponse<NotificationPreferences>>(
      "/notifications/preferences"
    ),

  updatePreferences: (data: UpdateNotificationPreferencesDto) =>
    api.put<SingleResponse<NotificationPreferences>>(
      "/notifications/preferences",
      data
    ),

  // Real-time polling (alternative to WebSocket)
  poll: (lastChecked?: string) => {
    const searchParams = new URLSearchParams();
    if (lastChecked) searchParams.set("since", lastChecked);

    const query = searchParams.toString();
    return api.get<SingleResponse<Notification[]>>(
      `/notifications/poll${query ? `?${query}` : ""}`
    );
  },
};

export default notificationsApi;
