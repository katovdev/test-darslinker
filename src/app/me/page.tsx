"use client";

import Link from "next/link";
import {
  User,
  Phone,
  Trophy,
  Star,
  BookOpen,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/context/auth-context";

export default function MePage() {
  const t = useTranslations();
  const user = useUser();

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "teacher":
        return t("admin.teacher");
      case "student":
        return t("admin.student");
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      default:
        return "";
    }
  };

  const getStatusBadge = () => {
    switch (user?.status) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
            {t("admin.active")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
            {t("admin.pending")}
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            {t("admin.suspended")}
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelName = (level: number) => {
    if (level >= 10) return "Master";
    if (level >= 7) return "Expert";
    if (level >= 5) return "Advanced";
    if (level >= 3) return "Intermediate";
    return "Beginner";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("sidebar.profile")}
        </h1>
        <p className="mt-1 text-gray-400">{t("profile.updateInfo")}</p>
      </div>

      <Card className="border-gray-800 bg-gray-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-400 to-blue-600">
              <AvatarFallback className="bg-transparent text-3xl font-bold text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                <h2 className="text-2xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h2>
                {getStatusBadge()}
              </div>
              <p className="mt-1 text-gray-400">{getRoleLabel()}</p>

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-300 sm:justify-start">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{user?.phone}</span>
                </div>
                {user?.telegramUsername && (
                  <div className="flex items-center justify-center gap-2 text-gray-300 sm:justify-start">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>@{user.telegramUsername}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === "student" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-gray-800 bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {t("dashboard.totalPoints")}
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user.points ?? 0}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {t("course.progress")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {t("profile.level")}
              </CardTitle>
              <Star className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {user.level ?? 1}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {getLevelName(user.level ?? 1)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                {t("dashboard.activeCourses")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">-</div>
              <p className="mt-1 text-xs text-gray-500">
                {t("course.enrolledCourses")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-gray-800 bg-gray-800/50 transition-colors hover:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">
                {t("dashboard.myCourses")}
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                {t("dashboard.continueJourney")}
              </p>
            </div>
            <Button asChild variant="ghost" size="icon">
              <Link href="/courses">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="h-5 w-5" />
            {t("sidebar.account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-400">
                {t("profile.firstName")}
              </label>
              <div className="mt-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-white">
                {user?.firstName || "-"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                {t("profile.lastName")}
              </label>
              <div className="mt-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-white">
                {user?.lastName || "-"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                {t("profile.phone")}
              </label>
              <div className="mt-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-white">
                {user?.phone || "-"}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">
                {t("sidebar.account")}
              </label>
              <div className="mt-1 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2 text-white">
                {getRoleLabel()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-400">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{t("profile.telegramNote")}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
