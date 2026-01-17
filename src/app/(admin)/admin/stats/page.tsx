"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  RefreshCw,
  Users,
  DollarSign,
  BookOpen,
  TrendingUp,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/hooks/use-locale";
import { adminAPI, type AdminStats } from "@/lib/api";

type Period = "week" | "month" | "year";

export default function AdminStatsPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("month");

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getStats({ period });
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
  }, [period]);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40 bg-gray-700" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full bg-gray-700" />
          <Skeleton className="h-64 w-full bg-gray-700" />
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

  // Calculate max values for charts
  const maxUserGrowth = Math.max(
    ...(stats?.userGrowth?.map((d) => d.count) || [1])
  );
  const maxRevenue = Math.max(
    ...(stats?.revenueGrowth?.map((d) => d.amount) || [1])
  );
  const maxCourses = Math.max(
    ...(stats?.courseCreation?.map((d) => d.count) || [1])
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("admin.analytics")}
          </h1>
          <p className="mt-1 text-gray-400">{t("admin.analyticsSubtitle")}</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-40 border-gray-700 bg-gray-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="week" className="text-gray-300">
              {t("admin.lastWeek")}
            </SelectItem>
            <SelectItem value="month" className="text-gray-300">
              {t("admin.lastMonth")}
            </SelectItem>
            <SelectItem value="year" className="text-gray-300">
              {t("admin.lastYear")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Users className="h-5 w-5 text-blue-400" />
              {t("admin.userGrowth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.userGrowth && stats.userGrowth.length > 0 ? (
              <div className="space-y-2">
                {stats.userGrowth.map((data, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500">
                      {new Date(data.date).toLocaleDateString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-4 rounded-full bg-blue-500 transition-all"
                        style={{
                          width: `${(data.count / maxUserGrowth) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-white">
                      {data.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noData")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Growth Chart */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <DollarSign className="h-5 w-5 text-green-400" />
              {t("admin.revenueGrowth")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.revenueGrowth && stats.revenueGrowth.length > 0 ? (
              <div className="space-y-2">
                {stats.revenueGrowth.map((data, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500">
                      {new Date(data.date).toLocaleDateString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-4 rounded-full bg-green-500 transition-all"
                        style={{
                          width: `${(data.amount / maxRevenue) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-20 text-right text-sm text-white">
                      {(data.amount / 1000).toFixed(0)}k
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noData")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Course Creation Chart */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BookOpen className="h-5 w-5 text-purple-400" />
              {t("admin.courseCreation")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.courseCreation && stats.courseCreation.length > 0 ? (
              <div className="space-y-2">
                {stats.courseCreation.map((data, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500">
                      {new Date(data.date).toLocaleDateString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-4 rounded-full bg-purple-500 transition-all"
                        style={{
                          width: `${(data.count / maxCourses) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-white">
                      {data.count}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noData")}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Teachers */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-yellow-400" />
              {t("admin.topTeachers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topTeachers && stats.topTeachers.length > 0 ? (
              <div className="space-y-4">
                {stats.topTeachers.map((teacher, index) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-yellow-700 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-700">
                        <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                          {getInitials(teacher.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {teacher.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {teacher.students} {t("admin.students")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        {(teacher.revenue / 1000).toFixed(0)}k UZS
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("admin.revenue")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                {t("admin.noData")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
