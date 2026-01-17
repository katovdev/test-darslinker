"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/use-locale";
import { teacherAPI, type TeacherStats } from "@/lib/api";

export default function TeacherStatsPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-gray-700" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
            <BarChart3 className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadStats}
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
          {t("teacher.analytics")}
        </h1>
        <p className="mt-1 text-gray-400">{t("teacher.analyticsDesc")}</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/10 p-3">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalRevenue")}
              </p>
              <p className="text-2xl font-bold text-white">
                {(stats?.totalRevenue || 0).toLocaleString()} UZS
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalStudents")}
              </p>
              <p className="text-2xl font-bold text-white">
                {stats?.totalStudents || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <BookOpen className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalCourses")}
              </p>
              <p className="text-2xl font-bold text-white">
                {stats?.totalCourses || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <Star className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.averageRating")}
              </p>
              <p className="text-2xl font-bold text-white">
                {stats?.averageRating?.toFixed(1) || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">{t("teacher.revenue")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4">
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.totalRevenue")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {(stats?.totalRevenue || 0).toLocaleString()} UZS
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-3">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4">
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.monthlyRevenue")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {(stats?.monthlyRevenue || 0).toLocaleString()} UZS
                </p>
              </div>
              <div className="rounded-full bg-blue-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">
              {t("teacher.students")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.totalStudents")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalStudents || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.activeStudents")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.activeStudents || 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("teacher.activeRate")}</span>
                <span className="text-white">
                  {stats?.totalStudents
                    ? Math.round(
                        ((stats?.activeStudents || 0) / stats.totalStudents) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  stats?.totalStudents
                    ? ((stats?.activeStudents || 0) / stats.totalStudents) * 100
                    : 0
                }
                className="h-2 bg-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">{t("teacher.courses")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.totalCourses")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalCourses || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t("teacher.published")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats?.publishedCourses || 0}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">
                  {t("teacher.publishedRate")}
                </span>
                <span className="text-white">
                  {stats?.totalCourses
                    ? Math.round(
                        ((stats?.publishedCourses || 0) / stats.totalCourses) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <Progress
                value={
                  stats?.totalCourses
                    ? ((stats?.publishedCourses || 0) / stats.totalCourses) *
                      100
                    : 0
                }
                className="h-2 bg-gray-700"
              />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">
              {t("teacher.performance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="relative mx-auto h-32 w-32">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#7EA2D4"
                    strokeWidth="10"
                    strokeDasharray={`${(stats?.completionRate || 0) * 2.83} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {Math.round(stats?.completionRate || 0)}%
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                {t("teacher.completionRate")}
              </p>
            </div>

            {stats?.averageRating && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-gray-800/50 p-4">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-bold text-white">
                  {stats.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  / 5.0 {t("teacher.averageRating")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
