"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserPlus,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-locale";
import { adminAPI, type AdminDashboard } from "@/lib/api";

export default function AdminDashboardPage() {
  const t = useTranslations();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getDashboard();
      if (response.success && response.data) {
        setDashboard(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
            Admin
          </Badge>
        );
      case "teacher":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
            {t("admin.teacher")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20">
            {t("admin.student")}
          </Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-gray-700" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full bg-gray-700" />
          <Skeleton className="h-64 w-full bg-gray-700" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <Users className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadDashboard}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("admin.dashboard")}
        </h1>
        <p className="mt-1 text-gray-400">{t("admin.dashboardSubtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("admin.totalUsers")}</p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.totalUsers || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <GraduationCap className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("admin.totalTeachers")}
              </p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.totalTeachers || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-cyan-500/10 p-3">
              <Users className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("admin.totalStudents")}
              </p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.totalStudents || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/10 p-3">
              <BookOpen className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("admin.totalCourses")}</p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.totalCourses || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("admin.totalRevenue")}</p>
              <p className="text-2xl font-bold text-white">
                {(dashboard?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <UserPlus className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("admin.pendingRequests")}
              </p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.pendingRequests || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {t("admin.recentUsers")}
            </CardTitle>
            <Link href="/admin/users">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-gray-400 hover:text-white"
              >
                {t("teacher.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard?.recentUsers && dashboard.recentUsers.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                        <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(user.role)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noRecentUsers")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Teachers */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {t("admin.recentTeachers")}
            </CardTitle>
            <Link href="/admin/teachers">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-gray-400 hover:text-white"
              >
                {t("teacher.viewAll")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {dashboard?.recentTeachers &&
            dashboard.recentTeachers.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700">
                        <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                          {getInitials(teacher.firstName, teacher.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{teacher.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {teacher.courseCount} {t("admin.courses")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher.studentCount} {t("admin.students")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noRecentTeachers")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {dashboard?.pendingRequests && dashboard.pendingRequests > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <UserPlus className="h-5 w-5 text-yellow-500" />
              <p className="text-sm text-yellow-500">
                {t("admin.pendingRequestsAlert", {
                  count: dashboard.pendingRequests,
                })}
              </p>
            </div>
            <Link href="/admin/requests">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                {t("admin.reviewRequests")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
