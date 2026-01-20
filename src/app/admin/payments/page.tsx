"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { adminService } from "@/services/admin";
import type { AdminPayment, Pagination } from "@/lib/api/admin";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminPaymentsPage() {
  const t = useTranslations();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    paymentId: string;
    reason: string;
  } | null>(null);

  const [imageModal, setImageModal] = useState<string | null>(null);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminService.listPayments({
        page,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (data) {
        setPayments(data.payments);
        setPagination(data.pagination);
      } else {
        setError(t("admin.statsLoadError") || "Failed to load payments");
      }
    } catch {
      setError(t("admin.statsLoadError") || "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter]);

  const handleApprove = async (paymentId: string) => {
    setIsUpdating(paymentId);
    setActionMenuId(null);

    const result = await adminService.updatePayment(paymentId, {
      status: "approved",
    });
    if (result) {
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: "approved" } : p))
      );
    }

    setIsUpdating(null);
  };

  const handleReject = async () => {
    if (!rejectModal) return;

    setIsUpdating(rejectModal.paymentId);

    const result = await adminService.updatePayment(rejectModal.paymentId, {
      status: "rejected",
      rejectionReason: rejectModal.reason || undefined,
    });
    if (result) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === rejectModal.paymentId
            ? { ...p, status: "rejected", rejectionReason: rejectModal.reason }
            : p
        )
      );
    }

    setIsUpdating(null);
    setRejectModal(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: React.ReactNode }> = {
      pending: {
        bg: "bg-yellow-500/10 text-yellow-400",
        icon: <Clock className="h-3 w-3" />,
      },
      approved: {
        bg: "bg-green-500/10 text-green-400",
        icon: <CheckCircle className="h-3 w-3" />,
      },
      rejected: {
        bg: "bg-red-500/10 text-red-400",
        icon: <XCircle className="h-3 w-3" />,
      },
    };
    const style = styles[status] || styles.pending;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.bg}`}
      >
        {style.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("admin.payments") || "Payments"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("teacher.managePayments") || "Manage all payments"}
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          <option value="all">
            {t("teacher.allPayments") || "All Payments"}
          </option>
          <option value="pending">{t("admin.pending") || "Pending"}</option>
          <option value="approved">{t("admin.approved") || "Approved"}</option>
          <option value="rejected">{t("admin.rejected") || "Rejected"}</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Student
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Course
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Date
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Receipt
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-2 text-gray-400">
                      {t("teacher.noPayments") || "No payments found"}
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">
                        {payment.student.firstName} {payment.student.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.student.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300">{payment.course.title}</p>
                      <p className="text-sm text-gray-500">
                        by {payment.course.teacher.firstName}{" "}
                        {payment.course.teacher.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(payment.status)}
                      {payment.rejectionReason && (
                        <p className="mt-1 text-xs text-red-400">
                          {payment.rejectionReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {payment.checkImageUrl && (
                        <button
                          onClick={() => setImageModal(payment.checkImageUrl)}
                          className="group relative"
                        >
                          <img
                            src={payment.checkImageUrl}
                            alt="Receipt"
                            className="h-10 w-14 rounded object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {payment.status === "pending" && (
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActionMenuId(
                                actionMenuId === payment.id ? null : payment.id
                              )
                            }
                            disabled={isUpdating === payment.id}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
                          >
                            {isUpdating === payment.id ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </button>

                          {actionMenuId === payment.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActionMenuId(null)}
                              />
                              <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl">
                                <button
                                  onClick={() => handleApprove(payment.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  {t("admin.approve") || "Approve"}
                                </button>
                                <button
                                  onClick={() => {
                                    setRejectModal({
                                      paymentId: payment.id,
                                      reason: "",
                                    });
                                    setActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                  {t("admin.reject") || "Reject"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} payments)
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

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-700 bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white">
              {t("teacher.rejectPayment") || "Reject Payment"}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {t("teacher.rejectPaymentDesc") ||
                "Please provide a reason for rejection."}
            </p>

            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              placeholder={
                t("teacher.rejectionReasonPlaceholder") || "Enter reason..."
              }
              className="mt-4 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              rows={3}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleReject}
                disabled={isUpdating === rejectModal.paymentId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isUpdating === rejectModal.paymentId ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.reject") || "Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImageModal(null)}
        >
          <img
            src={imageModal}
            alt="Receipt"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
