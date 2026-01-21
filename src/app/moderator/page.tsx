"use client";

import {
  Users,
  BookOpen,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAsyncData } from "@/hooks/use-async-data";
import { moderatorService } from "@/services/moderator";
import {
  PageHeader,
  RefreshButton,
  SectionHeader,
} from "@/components/ui/page-header";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
import { ErrorAlert, WarningAlert } from "@/components/ui/alert-box";

export default function ModeratorDashboardPage() {
  const t = useTranslations();

  const {
    data: stats,
    isLoading,
    error,
    refresh,
  } = useAsyncData(() => moderatorService.getStats(), { fetchOnMount: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("moderator.dashboardTitle") || "Moderator Dashboard"}
        subtitle={
          t("moderator.dashboardSubtitle") || "Manage users and courses"
        }
      >
        <RefreshButton
          onClick={refresh}
          isLoading={isLoading}
          label={t("common.refresh") || "Refresh"}
        />
      </PageHeader>

      <WarningAlert
        title={t("moderator.limitedAccessTitle") || "Limited Access"}
        icon={<FileText className="h-5 w-5" />}
      >
        {t("moderator.limitedAccessDesc") ||
          "Financial data (payments, earnings, balances) is not accessible with moderator role."}
      </WarningAlert>

      {error && !isLoading && (
        <ErrorAlert>
          {t("moderator.statsLoadError") || "Failed to load statistics"}
        </ErrorAlert>
      )}

      {isLoading && <SkeletonGrid count={8} columns={4} />}

      {!isLoading && stats && (
        <>
          <div className="space-y-4">
            <SectionHeader
              title={t("moderator.userStats") || "User Statistics"}
            />
            <StatCardGrid columns={5}>
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
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("moderator.courseStats") || "Course Statistics"}
            />
            <StatCardGrid columns={3}>
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
            </StatCardGrid>
          </div>
        </>
      )}
    </div>
  );
}
