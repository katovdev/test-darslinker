"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Bell, CheckCheck, Loader2, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications";
import type { Notification } from "@/types/notification";
import {
  getNotificationIcon,
  formatNotificationTime,
  groupNotificationsByDate,
} from "@/types/notification";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const { data } = await notificationsApi.getAll();
      setNotifications(data);
    } catch (error) {
      toast.error("Bildirishnomalarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Barcha bildirishnomalar o'qilgan deb belgilandi");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success("Bildirishnoma o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
      console.error(error);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.read
  );

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          title="Bildirishnomalar"
          subtitle={
            unreadCount > 0
              ? `${unreadCount} ta o'qilmagan bildirishnoma`
              : "Barcha bildirishnomalar o'qilgan"
          }
        />

        {/* Actions */}
        <Card className="border-gray-700 bg-gray-800 p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
                className={
                  filter === "all"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                }
              >
                Barchasi ({notifications.length})
              </Button>
              <Button
                variant={filter === "unread" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("unread")}
                className={
                  filter === "unread"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                }
              >
                O&apos;qilmaganlar ({unreadCount})
              </Button>
            </div>

            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={isMarkingAllRead}
                className="border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
              >
                {isMarkingAllRead ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Barchasini o&apos;qilgan deb belgilash
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications List */}
        {isLoading ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Bell className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              {filter === "unread"
                ? "O'qilmagan bildirishnomalar yo'q"
                : "Bildirishnomalar yo'q"}
            </h3>
            <p className="mt-2 text-gray-400">
              Yangi bildirishnomalar paydo bo&apos;lganda, bu yerda
              ko&apos;rinadi
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400 uppercase">
                  {date}
                </h3>
                <div className="space-y-2">
                  {notifs.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border-gray-700 p-4 transition-colors ${
                        !notification.read
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : "bg-gray-800"
                      }`}
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 text-3xl">
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-base ${
                                !notification.read
                                  ? "font-semibold text-white"
                                  : "text-gray-300"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="flex-shrink-0">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              </div>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-400">
                            {notification.message}
                          </p>

                          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                            <span>
                              {formatNotificationTime(notification.createdAt)}
                            </span>

                            <div className="flex gap-2">
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-emerald-400 hover:text-emerald-300"
                                >
                                  O&apos;qilgan deb belgilash
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="text-red-400 hover:text-red-300"
                              >
                                O&apos;chirish
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
