"use client";

import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAsyncData } from "@/hooks/use-async-data";
import { adminService } from "@/services/admin";
import {
  PageHeader,
  RefreshButton,
  SectionHeader,
} from "@/components/ui/page-header";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
import { ErrorAlert } from "@/components/ui/alert-box";
import { formatCurrency } from "@/lib/formatting";

export default function AdminDashboardPage() {
  const t = useTranslations();

  const {
    data: stats,
    isLoading,
    error,
    refresh,
  } = useAsyncData(() => adminService.getStats(), { fetchOnMount: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.dashboardTitle") || "Admin Dashboard"}
        subtitle={t("admin.dashboardSubtitle") || "Overview of your platform"}
      >
        <RefreshButton
          onClick={refresh}
          isLoading={isLoading}
          label={t("common.refresh") || "Refresh"}
        />
      </PageHeader>

      {error && !isLoading && (
        <ErrorAlert>
          {t("admin.statsLoadError") || "Failed to load statistics"}
        </ErrorAlert>
      )}

      {isLoading && <SkeletonGrid count={8} columns={4} />}

      {!isLoading && stats && (
        <>
          <div className="space-y-4">
            <SectionHeader title={t("admin.userStats") || "User Statistics"} />
            <StatCardGrid columns={4}>
              <StatCard
                icon={Users}
                label={t("admin.totalUsers") || "Total Users"}
                value={stats.users.total}
                color="blue"
              />
              <StatCard
                icon={UserCheck}
                label={t("admin.teachers") || "Teachers"}
                value={stats.users.teachers}
                color="green"
              />
              <StatCard
                icon={Users}
                label={t("admin.students") || "Students"}
                value={stats.users.students}
                color="purple"
              />
              <StatCard
                icon={UserX}
                label={t("admin.moderators") || "Moderators"}
                value={stats.users.moderators}
                color="orange"
              />
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("admin.courseStats") || "Course Statistics"}
            />
            <StatCardGrid columns={4}>
              <StatCard
                icon={BookOpen}
                label={t("admin.totalCourses") || "Total Courses"}
                value={stats.courses.total}
                color="blue"
              />
              <StatCard
                icon={TrendingUp}
                label={t("admin.activeCourses") || "Active Courses"}
                value={stats.courses.active}
                color="green"
              />
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("admin.paymentStats") || "Payment Statistics"}
            />
            <StatCardGrid columns={4}>
              <StatCard
                icon={CreditCard}
                label={t("admin.totalPayments") || "Total Payments"}
                value={stats.payments.total}
                color="blue"
              />
              <StatCard
                icon={Clock}
                label={t("admin.pendingPayments") || "Pending"}
                value={stats.payments.pending}
                color="yellow"
              />
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("admin.financialStats") || "Financial Statistics"}
            />
            <StatCardGrid columns={4}>
              <StatCard
                icon={DollarSign}
                label={t("admin.totalRevenue") || "Total Revenue"}
                value={formatCurrency(stats.financial.totalRevenue)}
                color="green"
                isLarge
              />
              <StatCard
                icon={DollarSign}
                label={t("admin.teacherBalance") || "Teacher Balances"}
                value={formatCurrency(stats.financial.totalTeacherBalance)}
                color="purple"
                isLarge
              />
            </StatCardGrid>
          </div>
        </>
      )}
    </div>
  );
}
