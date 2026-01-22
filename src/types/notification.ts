// Notification System Types
// Real-time notifications for users

export type NotificationType =
  | "assignment_graded"
  | "assignment_submitted"
  | "new_assignment"
  | "new_lesson"
  | "course_update"
  | "course_enrolled"
  | "course_completed"
  | "certificate_issued"
  | "payment_approved"
  | "payment_rejected"
  | "quiz_passed"
  | "quiz_failed"
  | "achievement_unlocked"
  | "message_received"
  | "review_posted"
  | "system_announcement";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string; // Optional link to navigate to
  metadata?: Record<string, unknown>; // Additional data
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  types: Partial<Record<NotificationType, boolean>>; // Enable/disable per type
  updatedAt: string;
}

export interface UpdateNotificationPreferencesDto {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  types?: Partial<Record<NotificationType, boolean>>;
}

// Batch operations
export interface MarkNotificationsReadDto {
  notificationIds?: string[]; // If empty, mark all as read
}

// Analytics
export interface NotificationAnalytics {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
  recentNotifications: Notification[];
}

// Helper functions
export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "assignment_graded":
      return "✅";
    case "assignment_submitted":
      return "📝";
    case "new_assignment":
      return "📋";
    case "new_lesson":
      return "📚";
    case "course_update":
      return "🔄";
    case "course_enrolled":
      return "🎓";
    case "course_completed":
      return "🏆";
    case "certificate_issued":
      return "🎖️";
    case "payment_approved":
      return "💰";
    case "payment_rejected":
      return "❌";
    case "quiz_passed":
      return "✨";
    case "quiz_failed":
      return "📉";
    case "achievement_unlocked":
      return "🏅";
    case "message_received":
      return "💬";
    case "review_posted":
      return "⭐";
    case "system_announcement":
      return "📢";
    default:
      return "🔔";
  }
}

export function getNotificationColor(type: NotificationType): string {
  switch (type) {
    case "assignment_graded":
    case "course_completed":
    case "certificate_issued":
    case "payment_approved":
    case "quiz_passed":
    case "achievement_unlocked":
      return "text-emerald-500";
    case "payment_rejected":
    case "quiz_failed":
      return "text-red-500";
    case "new_assignment":
    case "new_lesson":
    case "course_update":
    case "course_enrolled":
      return "text-blue-500";
    case "message_received":
    case "review_posted":
      return "text-purple-500";
    case "system_announcement":
      return "text-amber-500";
    default:
      return "text-muted-foreground";
  }
}

export function formatNotificationTime(createdAt: string): string {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
}

export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const thisWeek = new Date(today.getTime() - 7 * 86400000);

  notifications.forEach((notification) => {
    const created = new Date(notification.createdAt);
    const createdDate = new Date(
      created.getFullYear(),
      created.getMonth(),
      created.getDate()
    );

    if (createdDate.getTime() === today.getTime()) {
      groups.Today.push(notification);
    } else if (createdDate.getTime() === yesterday.getTime()) {
      groups.Yesterday.push(notification);
    } else if (createdDate >= thisWeek) {
      groups["This Week"].push(notification);
    } else {
      groups.Earlier.push(notification);
    }
  });

  return groups;
}
