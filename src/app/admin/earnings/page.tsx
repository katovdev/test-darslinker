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
          <h1 className="text-2xl font-bold text-white">
            {t("admin.earnings") || "Earnings"}
          </h1>
          <p className="mt-1 text-gray-400">
            Teacher earnings and balances overview
          </p>
        </div>
        <button
          onClick={loadEarnings}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-sm text-gray-400">Total Earnings (All Time)</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {isLoading ? "..." : formatCurrency(totals.totalEarnings)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Wallet className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-sm text-gray-400">Current Teacher Balances</p>
          <p className="mt-1 text-2xl font-bold text-white">
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
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Teacher
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Courses
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Students
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Total Earnings
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Current Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-700" />
                    </td>
                  </tr>
                ))
              ) : earnings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-2 text-gray-400">No earnings data found</p>
                  </td>
                </tr>
              ) : (
                earnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
                          {earning.firstName?.charAt(0)}
                          {earning.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {earning.firstName} {earning.lastName}
                          </p>
                          {earning.username ? (
                            <p className="text-sm text-gray-500">
                              @{earning.username}
                            </p>
                          ) : earning.businessName ? (
                            <p className="text-sm text-gray-500">
                              {earning.businessName}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        {earning.coursesCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="h-4 w-4 text-gray-500" />
                        {earning.studentsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-green-400">
                        {formatCurrency(earning.totalEarnings)}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">
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
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} teachers)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
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
