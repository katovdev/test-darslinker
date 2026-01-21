"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Search,
  RefreshCw,
  Trash2,
  Phone,
  User,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { toast } from "sonner";
import { moderatorService } from "@/services/moderator";
import type { Advice, AdviceStats } from "@/lib/api/moderator";

type AdviceStatus = "pending" | "contacted" | "resolved";

export default function ModeratorAdvicePage() {
  const t = useTranslations();
  const [advice, setAdvice] = useState<Advice[]>([]);
  const [stats, setStats] = useState<AdviceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdviceStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadAdvice = useCallback(async () => {
    setIsLoading(true);
    try {
      const [adviceData, statsData] = await Promise.allSettled([
        moderatorService.listAdvice({
          page,
          limit: 10,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: search || undefined,
        }),
        moderatorService.getAdviceStats(),
      ]);

      if (adviceData.status === "fulfilled" && adviceData.value) {
        setAdvice(adviceData.value.advice);
        setTotalPages(adviceData.value.pagination.totalPages);
      } else {
        toast.error(
          t("moderator.adviceLoadError") || "Failed to load advice requests"
        );
      }

      if (statsData.status === "fulfilled" && statsData.value) {
        setStats(statsData.value);
      }
    } catch {
      toast.error(
        t("moderator.adviceLoadError") || "Failed to load advice requests"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search, t]);

  useEffect(() => {
    loadAdvice();
  }, [loadAdvice]);

  const handleStatusChange = async (id: string, newStatus: AdviceStatus) => {
    const result = await moderatorService.updateAdviceStatus(id, {
      status: newStatus,
    });
    if (result) {
      toast.success(
        t("moderator.statusUpdated") || "Status updated successfully"
      );
      loadAdvice();
    } else {
      toast.error(
        t("moderator.statusUpdateError") || "Failed to update status"
      );
    }
  };

  const handleDelete = async (id: string) => {
    const success = await moderatorService.deleteAdvice(id);
    if (success) {
      toast.success(t("moderator.adviceDeleted") || "Advice request deleted");
      setDeleteConfirm(null);
      loadAdvice();
    } else {
      toast.error(
        t("moderator.deleteError") || "Failed to delete advice request"
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: AdviceStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "contacted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "resolved":
        return "bg-green-500/10 text-green-400 border-green-500/30";
    }
  };

  const getStatusIcon = (status: AdviceStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "contacted":
        return <Phone className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.adviceTitle") || "Advice Requests"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.adviceSubtitle") ||
              "Manage consultation requests from users"}
          </p>
        </div>
        <button
          onClick={loadAdvice}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            icon={MessageSquare}
            label={t("moderator.totalAdvice") || "Total Requests"}
            value={stats.total}
            color="blue"
          />
          <StatCard
            icon={Clock}
            label={t("moderator.pendingAdvice") || "Pending"}
            value={stats.pending}
            color="yellow"
          />
          <StatCard
            icon={Phone}
            label={t("moderator.contactedAdvice") || "Contacted"}
            value={stats.contacted}
            color="purple"
          />
          <StatCard
            icon={CheckCircle}
            label={t("moderator.resolvedAdvice") || "Resolved"}
            value={stats.resolved}
            color="green"
          />
          <StatCard
            icon={AlertCircle}
            label={t("moderator.recentAdvice") || "Last 7 Days"}
            value={stats.recent}
            color="orange"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              t("moderator.searchAdvice") ||
              "Search by name, phone, or comment..."
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as AdviceStatus | "all");
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        >
          <option value="all">
            {t("moderator.allStatuses") || "All Statuses"}
          </option>
          <option value="pending">{t("moderator.pending") || "Pending"}</option>
          <option value="contacted">
            {t("moderator.contacted") || "Contacted"}
          </option>
          <option value="resolved">
            {t("moderator.resolved") || "Resolved"}
          </option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-800/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  {t("moderator.name") || "Name"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  {t("moderator.phone") || "Phone"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  {t("moderator.comment") || "Comment"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  {t("moderator.date") || "Date"}
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  {t("moderator.status") || "Status"}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
                  {t("moderator.actions") || "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td colSpan={6} className="px-4 py-4">
                      <div className="h-6 animate-pulse rounded bg-gray-700/50" />
                    </td>
                  </tr>
                ))
              ) : advice.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {t("moderator.noAdvice") || "No advice requests found"}
                  </td>
                </tr>
              ) : (
                advice.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-700">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <span className="font-medium text-white">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <a
                        href={`tel:${item.phone}`}
                        className="text-green-400 hover:underline"
                      >
                        {item.phone}
                      </a>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p
                        className="truncate text-gray-300"
                        title={item.comment || ""}
                      >
                        {item.comment || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleStatusChange(
                            item.id,
                            e.target.value as AdviceStatus
                          )
                        }
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${getStatusColor(
                          item.status
                        )} cursor-pointer bg-transparent focus:ring-2 focus:ring-green-500 focus:outline-none`}
                      >
                        <option
                          value="pending"
                          className="bg-gray-800 text-yellow-400"
                        >
                          {t("moderator.pending") || "Pending"}
                        </option>
                        <option
                          value="contacted"
                          className="bg-gray-800 text-blue-400"
                        >
                          {t("moderator.contacted") || "Contacted"}
                        </option>
                        <option
                          value="resolved"
                          className="bg-gray-800 text-green-400"
                        >
                          {t("moderator.resolved") || "Resolved"}
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {deleteConfirm === item.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="rounded-lg bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
                            >
                              {t("common.confirm") || "Confirm"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-600"
                            >
                              {t("common.cancel") || "Cancel"}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400"
                            title={t("common.delete") || "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-700 px-4 py-3">
            <p className="text-sm text-gray-400">
              {t("moderator.page") || "Page"} {page} {t("moderator.of") || "of"}{" "}
              {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "green" | "yellow" | "purple" | "orange";
}

const StatCard = memo(function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-400",
    green: "bg-green-500/10 text-green-400",
    yellow: "bg-yellow-500/10 text-yellow-400",
    purple: "bg-purple-500/10 text-purple-400",
    orange: "bg-orange-500/10 text-orange-400",
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-colors hover:border-gray-700">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
});
