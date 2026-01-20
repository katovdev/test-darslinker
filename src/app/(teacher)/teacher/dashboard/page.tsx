"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  DollarSign,
  Clock,
  RefreshCw,
  ArrowUpRight,
  Phone,
  MessageCircle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import {
  teacherAPI,
  type TeacherDashboard,
  type DashboardPeriod,
} from "@/lib/api";

export default function TeacherDashboardPage() {
  const t = useTranslations();
  const user = useUser();
  const [dashboard, setDashboard] = useState<TeacherDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<DashboardPeriod>("all");

  const loadDashboard = async (selectedPeriod: DashboardPeriod = period) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getDashboard({
        period: selectedPeriod,
      });
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

  const handlePeriodChange = (value: DashboardPeriod) => {
    setPeriod(value);
    loadDashboard(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64 bg-gray-700" />
          <Skeleton className="h-10 w-40 bg-gray-700" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full bg-gray-700" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 w-full bg-gray-700" />
          <Skeleton className="h-80 w-full bg-gray-700" />
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
            <BookOpen className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={() => loadDashboard()}
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
      {/* Welcome Header with Period Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {t("dashboard.welcomeBack")
              .replace("{name}", user?.firstName || "")
              .replace("{{name}}", user?.firstName || "")}
          </h1>
          <p className="mt-1 text-gray-400">{t("teacher.dashboardSubtitle")}</p>
        </div>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px] border-gray-700 bg-gray-800 text-white">
            <SelectValue placeholder={t("teacher.filterByPeriod")} />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="all" className="text-white hover:bg-gray-700">
              {t("teacher.allTime")}
            </SelectItem>
            <SelectItem value="week" className="text-white hover:bg-gray-700">
              {t("teacher.thisWeek")}
            </SelectItem>
            <SelectItem value="month" className="text-white hover:bg-gray-700">
              {t("teacher.thisMonth")}
            </SelectItem>
            <SelectItem value="year" className="text-white hover:bg-gray-700">
              {t("teacher.thisYear")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                {dashboard?.totalStudents || 0}
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
                {dashboard?.totalCourses || 0}
              </p>
            </div>
          </CardContent>
        </Card>

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
                {(dashboard?.totalRevenue || 0).toLocaleString()} UZS
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.pendingPayments")}
              </p>
              <p className="text-2xl font-bold text-white">
                {dashboard?.pendingPayments || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Stats with Earnings */}
      {dashboard?.courseStats && dashboard.courseStats.length > 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {t("teacher.courseStats")}
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-[#7EA2D4] hover:text-[#7EA2D4]"
            >
              <Link href="/teacher/courses">
                {t("teacher.viewAll")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-transparent">
                    <TableHead className="text-gray-400">
                      {t("teacher.courseName")}
                    </TableHead>
                    <TableHead className="text-gray-400">
                      {t("teacher.status")}
                    </TableHead>
                    <TableHead className="text-right text-gray-400">
                      {t("teacher.students")}
                    </TableHead>
                    <TableHead className="text-right text-gray-400">
                      {t("teacher.earnings")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.courseStats.map((course) => (
                    <TableRow
                      key={course.courseId}
                      className="border-gray-700 hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-white">
                        {course.courseName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            course.status === "active"
                              ? "border-green-500/20 bg-green-500/10 text-green-400"
                              : course.status === "draft"
                                ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                                : "border-gray-500/20 bg-gray-500/10 text-gray-400"
                          }
                        >
                          {t(`teacher.status.${course.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {course.studentsCount}
                      </TableCell>
                      <TableCell className="text-right text-green-400">
                        {course.earnings.toLocaleString()} UZS
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Students and Payments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {t("teacher.recentStudents")}
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-[#7EA2D4] hover:text-[#7EA2D4]"
            >
              <Link href="/teacher/students">
                {t("teacher.viewAll")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard?.recentStudents &&
            dashboard.recentStudents.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentStudents.slice(0, 5).map((student) => (
                  <div
                    key={student.enrollmentId}
                    className="rounded-lg bg-gray-800/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">
                          {student.studentName}
                        </p>
                        <p className="truncate text-sm text-gray-400">
                          {student.courseName}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </span>
                          {student.telegramUsername && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />@
                              {student.telegramUsername}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(student.enrolledAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Users className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-400">
                  {t("teacher.noRecentStudents")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">
              {t("teacher.recentPayments")}
            </CardTitle>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="gap-1 text-[#7EA2D4] hover:text-[#7EA2D4]"
            >
              <Link href="/teacher/payments">
                {t("teacher.viewAll")}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard?.recentPayments &&
            dashboard.recentPayments.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recentPayments.slice(0, 5).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">
                        {payment.studentName}
                      </p>
                      <p className="truncate text-sm text-gray-400">
                        {payment.courseName}
                      </p>
                      <p className="mt-1 text-sm font-medium text-green-400">
                        {payment.amount.toLocaleString()} UZS
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant="outline"
                        className={
                          payment.status === "approved"
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : payment.status === "rejected"
                              ? "border-red-500/20 bg-red-500/10 text-red-400"
                              : "border-yellow-500/20 bg-yellow-500/10 text-yellow-400"
                        }
                      >
                        {t(`teacher.paymentStatus.${payment.status}`)}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <DollarSign className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-400">
                  {t("teacher.noRecentPayments")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
