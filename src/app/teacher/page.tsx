"use client";

import {
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAsyncData } from "@/hooks/use-async-data";
import { toast } from "sonner";
import { teacherService } from "@/services/teacher";
import {
  PageHeader,
  RefreshButton,
  SectionHeader,
} from "@/components/ui/page-header";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
import { ErrorAlert } from "@/components/ui/alert-box";
import { formatCurrency } from "@/lib/formatting";

export default function TeacherDashboardPage() {
  const t = useTranslations();

  const {
    data: stats,
    isLoading,
    error,
    refresh,
  } = useAsyncData(() => teacherService.getStats(), {
    fetchOnMount: true,
    onError: () => {
      toast.error(t("teacher.statsLoadError") || "Failed to load statistics");
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("teacher.dashboardTitle") || "Teacher Dashboard"}
        subtitle={
          t("teacher.dashboardSubtitle") ||
          "Overview of your courses and earnings"
        }
      >
        <RefreshButton
          onClick={refresh}
          isLoading={isLoading}
          label={t("common.refresh") || "Refresh"}
        />
      </PageHeader>

      {error && !isLoading && (
        <ErrorAlert>
          {t("teacher.statsLoadError") || "Failed to load statistics"}
        </ErrorAlert>
      )}

      {isLoading && <SkeletonGrid count={8} columns={4} />}

      {!isLoading && stats && (
        <>
          <div className="space-y-4">
            <SectionHeader
              title={t("teacher.courseStats") || "Course Statistics"}
            />
            <StatCardGrid columns={3}>
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
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("teacher.studentStats") || "Student Statistics"}
            />
            <StatCardGrid columns={3}>
              <StatCard
                icon={Users}
                label={t("teacher.totalStudents") || "Total Students"}
                value={stats.students.total}
                color="purple"
              />
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader
              title={t("teacher.paymentStats") || "Payment Statistics"}
            />
            <StatCardGrid columns={3}>
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
            </StatCardGrid>
          </div>

          <div className="space-y-4">
            <SectionHeader title={t("teacher.earningsStats") || "Earnings"} />
            <StatCardGrid columns={2}>
              <StatCard
                icon={DollarSign}
                label={t("teacher.totalEarnings") || "Total Earnings"}
                value={formatCurrency(stats.earnings.total)}
                color="green"
              />
              <StatCard
                icon={DollarSign}
                label={t("teacher.currentBalance") || "Current Balance"}
                value={formatCurrency(stats.earnings.currentBalance)}
                color="purple"
              />
            </StatCardGrid>
          </div>
        </>
      )}
    </div>
  );
}
