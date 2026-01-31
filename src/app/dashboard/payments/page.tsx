"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { ActionMenu, ActionMenuItem } from "@/components/ui/action-menu";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { adminService } from "@/services/admin";
import type { AdminPayment, Pagination } from "@/lib/api/admin";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function DashboardPaymentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const t = useTranslations();
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleApprove = async (paymentId: string) => {
    setIsUpdating(paymentId);

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

  // Authorization check
  if (user && user.role !== "admin" && user.role !== "teacher") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.payments") || "Payments"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("teacher.managePayments") || "Manage all payments"}
          </p>
        </div>
        <button
          onClick={loadPayments}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
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
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
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

      <div className="overflow-hidden rounded-xl border border-border bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Student
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Course
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Receipt
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t("teacher.noPayments") || "No payments found"}
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border transition-colors hover:bg-card"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {payment.student.firstName} {payment.student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.student.phone}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{payment.course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        by {payment.course.teacher.firstName}{" "}
                        {payment.course.teacher.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
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
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {payment.checkImageUrl && (
                        <button
                          onClick={() => setImageModal(payment.checkImageUrl)}
                          className="group relative"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={payment.checkImageUrl}
                            alt="Receipt"
                            className="h-10 w-14 rounded object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <Eye className="h-4 w-4 text-foreground" />
                          </div>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {payment.status === "pending" && (
                        <ActionMenu isLoading={isUpdating === payment.id}>
                          <ActionMenuItem
                            onClick={() => handleApprove(payment.id)}
                            icon={<CheckCircle className="h-4 w-4" />}
                            variant="success"
                          >
                            {t("admin.approve") || "Approve"}
                          </ActionMenuItem>
                          <ActionMenuItem
                            onClick={() => {
                              setRejectModal({
                                paymentId: payment.id,
                                reason: "",
                              });
                            }}
                            icon={<XCircle className="h-4 w-4" />}
                            variant="danger"
                          >
                            {t("admin.reject") || "Reject"}
                          </ActionMenuItem>
                        </ActionMenu>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} payments)
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

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-secondary p-6">
            <h3 className="text-lg font-semibold text-foreground">
              {t("teacher.rejectPayment") || "Reject Payment"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
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
              className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
              rows={3}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleReject}
                disabled={isUpdating === rejectModal.paymentId}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-red-700 disabled:opacity-50"
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
