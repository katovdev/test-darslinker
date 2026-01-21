"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { teacherService } from "@/services/teacher";
import type { TeacherStats } from "@/lib/api/teacher";

export default function TeacherDashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await teacherService.getStats();
      if (data) {
        setStats(data);
      } else {
        setError(t("teacher.statsLoadError") || "Failed to load statistics");
      }
    } catch {
      setError(t("teacher.statsLoadError") || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("teacher.dashboardTitle") || "Teacher Dashboard"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("teacher.dashboardSubtitle") || "Overview of your courses and earnings"}
          </p>
        </div>
        <button
          onClick={loadStats}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-6"
            >
              <div className="mb-4 h-10 w-10 rounded-lg bg-gray-700/50" />
              <div className="mb-2 h-4 w-20 rounded bg-gray-700/50" />
              <div className="h-8 w-16 rounded bg-gray-700/50" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && stats && (
        <>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("teacher.courseStats") || "Course Statistics"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={BookOpen}
                label={t("teacher.totalCourses") || "Total Courses"}
                value={stats.courses.total}
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                label={t("teacher.activeCourses") || "Active Courses"}
                value={stats.courses.active}
                color="green"
              />
              <StatCard
                icon={Clock}
                label={t("teacher.draftCourses") || "Draft Courses"}
                value={stats.courses.draft}
                color="yellow"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("teacher.studentStats") || "Student Statistics"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={Users}
                label={t("teacher.totalStudents") || "Total Students"}
                value={stats.students.total}
                color="purple"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("teacher.paymentStats") || "Payment Statistics"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={CreditCard}
                label={t("teacher.totalPayments") || "Total Payments"}
                value={stats.payments.total}
                color="blue"
              />
              <StatCard
                icon={Clock}
                label={t("teacher.pendingPayments") || "Pending"}
                value={stats.payments.pending}
                color="yellow"
              />
              <StatCard
                icon={CheckCircle}
                label={t("teacher.approvedPayments") || "Approved"}
                value={stats.payments.approved}
                color="green"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("teacher.earningsStats") || "Earnings"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard
                icon={DollarSign}
                label={t("teacher.totalEarnings") || "Total Earnings"}
                value={formatCurrency(stats.earnings.total)}
                color="green"
                isLarge
              />
              <StatCard
                icon={DollarSign}
                label={t("teacher.currentBalance") || "Current Balance"}
                value={formatCurrency(stats.earnings.currentBalance)}
                color="purple"
                isLarge
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: "blue" | "green" | "purple" | "orange" | "yellow";
  isLarge?: boolean;
}

function StatCard({ icon: Icon, label, value, color, isLarge }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
  };

  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-800/30 p-6 transition-colors hover:border-gray-700 ${
        isLarge ? "sm:col-span-1" : ""
      }`}
    >
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
