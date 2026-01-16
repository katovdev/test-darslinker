"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  CreditCard,
  BookOpen,
  Award,
  FileText,
  Info,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import {
  notificationAPI,
  type Notification,
  type NotificationType,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const notificationIcons: Record<NotificationType, typeof Bell> = {
  assignment_graded: CheckCircle,
  payment_approved: CreditCard,
  payment_submitted: CreditCard,
  course_enrolled: BookOpen,
  lesson_completed: CheckCircle,
  quiz_passed: Award,
  certificate_ready: Award,
  general: Info,
};

const notificationColors: Record<NotificationType, string> = {
  assignment_graded: "text-green-400 bg-green-500/10",
  payment_approved: "text-green-400 bg-green-500/10",
  payment_submitted: "text-yellow-400 bg-yellow-500/10",
  course_enrolled: "text-blue-400 bg-blue-500/10",
  lesson_completed: "text-green-400 bg-green-500/10",
  quiz_passed: "text-purple-400 bg-purple-500/10",
  certificate_ready: "text-purple-400 bg-purple-500/10",
  general: "text-gray-400 bg-gray-500/10",
};

export default function NotificationsPage() {
  const t = useTranslations();
  const user = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationAPI.getNotifications(user.id);
      if (response.success && response.data) {
        setNotifications(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
    } catch {
      console.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id || markingAll) return;

    setMarkingAll(true);
    try {
      await notificationAPI.markAllAsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      console.error("Failed to mark all notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("notifications.justNow");
    if (diffMins < 60)
      return t("notifications.minutesAgo", { count: diffMins.toString() });
    if (diffHours < 24)
      return t("notifications.hoursAgo", { count: diffHours.toString() });
    return t("notifications.daysAgo", { count: diffDays.toString() });
  };

  const getNotificationTypeLabel = (type: NotificationType): string => {
    const labels: Record<NotificationType, string> = {
      assignment_graded: t("notifications.assignmentGraded"),
      payment_approved: t("notifications.paymentApproved"),
      payment_submitted: t("notifications.paymentSubmitted"),
      course_enrolled: t("notifications.courseEnrolled"),
      lesson_completed: t("notifications.lessonCompleted"),
      quiz_passed: t("notifications.quizPassed"),
      certificate_ready: t("notifications.certificateReady"),
      general: t("notifications.general"),
    };
    return labels[type] || t("notifications.general");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("notifications.title")}
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-gray-400">{unreadCount} unread</p>
          )}
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            {markingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {t("notifications.markAllRead")}
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-gray-800 bg-gray-800/30">
              <CardContent className="flex items-start gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                  <Skeleton className="h-3 w-1/2 bg-gray-700" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <Bell className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button
              onClick={loadNotifications}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && notifications.length === 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-800 p-4">
              <Bell className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("notifications.noNotifications")}
              </h3>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && !error && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] || Bell;
            const colorClass =
              notificationColors[notification.type] ||
              notificationColors.general;

            return (
              <Card
                key={notification._id}
                className={cn(
                  "border-gray-800 transition-colors",
                  notification.read ? "bg-gray-800/20" : "bg-gray-800/40"
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn("rounded-full p-2.5", colorClass)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p
                            className={cn(
                              "font-medium",
                              notification.read ? "text-gray-300" : "text-white"
                            )}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-1 text-sm text-gray-400">
                            {notification.message}
                          </p>
                        </div>

                        {!notification.read && (
                          <div className="h-2 w-2 flex-shrink-0 rounded-full bg-[#7EA2D4]" />
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        <span>•</span>
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-2">
                        {notification.link && (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 border-gray-700 text-xs text-gray-300 hover:bg-gray-800"
                          >
                            <Link href={notification.link}>View</Link>
                          </Button>
                        )}

                        {!notification.read && (
                          <Button
                            onClick={() => handleMarkAsRead(notification._id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-gray-400 hover:text-white"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
