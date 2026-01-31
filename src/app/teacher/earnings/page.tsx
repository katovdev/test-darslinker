"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  RefreshCw,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { teacherService } from "@/services/teacher";
import type { TeacherEarnings } from "@/lib/api/teacher";

export default function TeacherEarningsPage() {
  const t = useTranslations();
  const [earnings, setEarnings] = useState<TeacherEarnings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEarnings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await teacherService.getEarnings();
      if (data) {
        setEarnings(data);
      } else {
        setError(t("teacher.earningsLoadError") || "Failed to load earnings");
      }
    } catch {
      setError(t("teacher.earningsLoadError") || "Failed to load earnings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("teacher.earningsTitle") || "My Earnings"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("teacher.earningsSubtitle") ||
              "Overview of your earnings and balance"}
          </p>
        </div>
        <button
          onClick={loadEarnings}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
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
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border bg-card p-6"
              >
                <div className="mb-4 h-10 w-10 rounded-lg bg-secondary/50" />
                <div className="mb-2 h-4 w-20 rounded bg-secondary/50" />
                <div className="h-8 w-24 rounded bg-secondary/50" />
              </div>
            ))}
          </div>
          <div className="animate-pulse rounded-xl border border-border bg-card p-6">
            <div className="mb-4 h-6 w-40 rounded bg-secondary/50" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded bg-secondary/50" />
              ))}
            </div>
          </div>
        </div>
      )}

      {!isLoading && earnings && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("teacher.totalEarnings") || "Total Earnings"}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(earnings.totalEarnings)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <DollarSign className="h-5 w-5 text-purple-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("teacher.currentBalance") || "Current Balance"}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(earnings.currentBalance)}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("teacher.totalCourses") || "Total Courses"}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {earnings.coursesCount}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-border">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("teacher.totalStudents") || "Total Students"}
              </p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {earnings.studentsCount}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">
              {t("teacher.earningsByCourse") || "Earnings by Course"}
            </h2>

            {earnings.earningsByCourse.length === 0 ? (
              <div className="py-8 text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">
                  {t("teacher.noEarningsYet") || "No earnings yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.earningsByCourse.map((item) => (
                  <div
                    key={item.course.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {item.course.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.paymentsCount}{" "}
                        {t("teacher.payments") || "payments"}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-green-400">
                      {formatCurrency(item.totalAmount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
