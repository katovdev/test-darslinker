"use client";

import { useEffect, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/notification";
import {
  getNotificationIcon,
  formatNotificationTime,
} from "@/types/notification";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: count } = await notificationsApi.getUnreadCount();
      setUnreadCount(count.count);
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount only
    fetchNotifications();
  }, [fetchNotifications]);

  const loadNotifications = async () => {
    if (notifications.length > 0) return; // Already loaded

    setIsLoading(true);
    try {
      const { data } = await notificationsApi.getAll();
      // Limit to 5 most recent notifications
      setNotifications(data.slice(0, 5));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadNotifications();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-400 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 border-gray-700 bg-gray-800 p-0"
      >
        <div className="border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Bildirishnomalar</h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-400"
              >
                {unreadCount} yangi
              </Badge>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-400">Yuklanmoqda...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-2 text-sm text-gray-400">
                Bildirishnomalar yo&apos;q
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-4 text-left transition-colors hover:bg-gray-700/50 ${
                    !notification.read ? "bg-emerald-500/5" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          !notification.read
                            ? "font-semibold text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatNotificationTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 p-2">
          <Link
            href="/dashboard/notifications"
            className="block w-full rounded-lg px-4 py-2 text-center text-sm text-emerald-400 transition-colors hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Barchasini ko&apos;rish
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
