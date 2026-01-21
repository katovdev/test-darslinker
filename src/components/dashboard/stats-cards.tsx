"use client";

import { BookOpen, Users, DollarSign, Star } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { StatCard, StatCardGrid } from "@/components/ui/stat-card";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
import { formatCurrency } from "@/lib/formatting";

interface StatsData {
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

interface StatsCardsProps {
  stats?: StatsData;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const t = useTranslations();

  if (isLoading) {
    return <SkeletonGrid count={4} columns={4} />;
  }

  return (
    <StatCardGrid columns={4}>
      <StatCard
        icon={BookOpen}
        label={t("stats.activeCourses") || "Active Courses"}
        value={stats?.activeCourses ?? 0}
        color="blue"
      />
      <StatCard
        icon={Users}
        label={t("stats.totalStudents") || "Total Students"}
        value={stats?.totalStudents ?? 0}
        color="green"
      />
      <StatCard
        icon={DollarSign}
        label={t("stats.totalRevenue") || "Total Revenue"}
        value={
          stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "0 UZS"
        }
        color="yellow"
      />
      <StatCard
        icon={Star}
        label={t("stats.averageRating") || "Average Rating"}
        value={stats?.averageRating?.toFixed(1) ?? "0.0"}
        color="purple"
      />
    </StatCardGrid>
  );
}
