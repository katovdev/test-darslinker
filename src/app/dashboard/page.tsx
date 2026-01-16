"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import { StatsCards, ProfileCard } from "@/components/dashboard";

interface DashboardStats {
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

export default function DashboardPage() {
  const t = useTranslations();
  const user = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    // In production, this would be an API call
    const loadDashboardData = async () => {
      try {
        // Simulated data for now
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setStats({
          activeCourses: 3,
          totalStudents: 45,
          totalRevenue: 2500000,
          averageRating: 4.7,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {t("dashboard.welcomeBack", { name: user?.firstName || "" })}
        </h1>
        <p className="mt-1 text-gray-400">{t("dashboard.continueJourney")}</p>
      </div>

      {/* Profile Card */}
      <ProfileCard
        rating={stats?.averageRating}
        specialization="Online Education"
        location="Tashkent, Uzbekistan"
      />

      {/* Stats Cards */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          {t("dashboard.activeCourses")}
        </h2>
        <StatsCards
          stats={stats || undefined}
          isLoading={isLoading}
        />
      </div>

      {/* Courses Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">
          {t("dashboard.myCourses")}
        </h2>
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-8 text-center">
          <p className="text-gray-400">{t("dashboard.noEnrolledCourses")}</p>
          <p className="mt-2 text-sm text-gray-500">
            {t("dashboard.browseAllCourses")}
          </p>
        </div>
      </div>
    </div>
  );
}
