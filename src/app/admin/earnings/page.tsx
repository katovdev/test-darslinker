"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  BookOpen,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { adminService } from "@/services/admin";
import type { AdminEarning, Pagination } from "@/lib/api/admin";

export default function AdminEarningsPage() {
  const t = useTranslations();
  const [earnings, setEarnings] = useState<AdminEarning[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [totals, setTotals] = useState({
    totalBalance: 0,
    totalEarnings: 0,
  });

  const loadEarnings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminService.listEarnings({
        page,
        limit: 20,
      });

      if (data) {
        setEarnings(data.earnings);
        setPagination(data.pagination);

        // Calculate totals
        const totalBalance = data.earnings.reduce(
          (sum, e) => sum + e.currentBalance,
          0
        );
        const totalEarnings = data.earnings.reduce(
          (sum, e) => sum + e.totalEarnings,
          0
        );
        setTotals({ totalBalance, totalEarnings });
      } else {
        setError(t("admin.statsLoadError") || "Failed to load earnings");
      }
    } catch {
      setError(t("admin.statsLoadError") || "Failed to load earnings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, [page]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.earnings") || "Earnings"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Teacher earnings and balances overview
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

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-sm text-muted-foreground">Total Earnings (All Time)</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {isLoading ? "..." : formatCurrency(totals.totalEarnings)}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Wallet className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-sm text-muted-foreground">Current Teacher Balances</p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {isLoading ? "..." : formatCurrency(totals.totalBalance)}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Earnings Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Teacher
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Courses
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Students
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Total Earnings
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Current Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-secondary" />
                    </td>
                  </tr>
                ))
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">No earnings data found</p>
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="border-b border-border transition-colors hover:bg-secondary"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-foreground">
                          {earning.firstName?.charAt(0)}
                          {earning.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {earning.firstName} {earning.lastName}
                          </p>
                          {earning.username ? (
                            <p className="text-sm text-muted-foreground">
                              @{earning.username}
                            </p>
                          ) : earning.businessName ? (
                            <p className="text-sm text-muted-foreground">
                              {earning.businessName}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {earning.coursesCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {earning.studentsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-green-400">
                        {formatCurrency(earning.totalEarnings)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {formatCurrency(earning.currentBalance)}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} teachers)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                {t("blog.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
