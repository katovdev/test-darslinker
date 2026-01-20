"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  RefreshCw,
  UserCheck,
  UserX,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { moderatorService } from "@/services/moderator";
import type { ModeratorStats } from "@/lib/api/moderator";

export default function ModeratorDashboardPage() {
  const t = useTranslations();
  const [stats, setStats] = useState<ModeratorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await moderatorService.getStats();
      if (data) {
        setStats(data);
      } else {
        setError(t("moderator.statsLoadError") || "Failed to load statistics");
      }
    } catch {
      setError(t("moderator.statsLoadError") || "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.dashboardTitle") || "Moderator Dashboard"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.dashboardSubtitle") || "Manage users and courses"}
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

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-400">
              {t("moderator.limitedAccessTitle") || "Limited Access"}
            </p>
            <p className="text-sm text-yellow-400/80">
              {t("moderator.limitedAccessDesc") ||
                "Financial data (payments, earnings, balances) is not accessible with moderator role."}
            </p>
          </div>
        </div>
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
              {t("moderator.userStats") || "User Statistics"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard
                icon={Users}
                label={t("moderator.totalUsers") || "Total Users"}
                value={stats.users.total}
                color="blue"
              />
              <StatCard
                icon={UserCheck}
                label={t("moderator.teachers") || "Teachers"}
                value={stats.users.teachers}
                color="green"
              />
              <StatCard
                icon={Users}
                label={t("moderator.students") || "Students"}
                value={stats.users.students}
                color="purple"
              />
              <StatCard
                icon={Clock}
                label={t("moderator.pendingUsers") || "Pending"}
                value={stats.users.pending}
                color="yellow"
              />
              <StatCard
                icon={UserX}
                label={t("moderator.blockedUsers") || "Blocked"}
                value={stats.users.blocked}
                color="red"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("moderator.courseStats") || "Course Statistics"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                icon={BookOpen}
                label={t("moderator.totalCourses") || "Total Courses"}
                value={stats.courses.total}
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                label={t("moderator.activeCourses") || "Active Courses"}
                value={stats.courses.active}
                color="green"
              />
              <StatCard
                icon={FileText}
                label={t("moderator.draftCourses") || "Draft Courses"}
                value={stats.courses.draft}
                color="gray"
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
  color: "blue" | "green" | "purple" | "yellow" | "red" | "gray";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    purple: "bg-purple-500/10 text-purple-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    red: "bg-red-500/10 text-red-400",
    gray: "bg-gray-500/10 text-gray-400",
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-6 transition-colors hover:border-gray-700">
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
