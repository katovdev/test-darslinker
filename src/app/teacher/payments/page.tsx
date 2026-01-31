"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/use-locale";
import { teacherService } from "@/services/teacher";
import { teacherApi } from "@/lib/api/teacher";
import type {
  TeacherPayment,
  TeacherCourse,
  Pagination,
} from "@/lib/api/teacher";

export default function TeacherPaymentsPage() {
  const t = useTranslations();
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Approval/Rejection state
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{
    paymentId: string;
    reason: string;
  } | null>(null);
  const [isRejecting, setIsRejecting] = useState(false);

  // Memoized load payments function
  const loadPayments = useCallback(
    async (currentPage: number, status: string, courseId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await teacherService.listPayments({
          page: currentPage,
          limit: 20,
          status: (status as "pending" | "approved" | "rejected") || undefined,
          courseId: courseId || undefined,
        });

        if (data) {
          setPayments(data.payments);
          setPagination(data.pagination);
        } else {
          const errorMsg =
            t("teacher.paymentsLoadError") || "Failed to load payments";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch {
        const errorMsg =
          t("teacher.paymentsLoadError") || "Failed to load payments";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  // Initial load: fetch courses and payments in parallel
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      const [coursesResult, paymentsResult] = await Promise.allSettled([
        teacherService.listCourses({ limit: 100 }),
        teacherService.listPayments({ page: 1, limit: 20 }),
      ]);

      if (coursesResult.status === "fulfilled" && coursesResult.value) {
        setCourses(coursesResult.value.courses);
      }

      if (paymentsResult.status === "fulfilled" && paymentsResult.value) {
        setPayments(paymentsResult.value.payments);
        setPagination(paymentsResult.value.pagination);
      } else {
        const errorMsg =
          t("teacher.paymentsLoadError") || "Failed to load payments";
        setError(errorMsg);
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, [t]);

  // Reload payments when filters change (skip initial)
  useEffect(() => {
    if (page === 1 && !statusFilter && !selectedCourse) return;
    loadPayments(page, statusFilter, selectedCourse);
  }, [page, statusFilter, selectedCourse, loadPayments]);

  const handleRefresh = useCallback(() => {
    loadPayments(page, statusFilter, selectedCourse);
  }, [page, statusFilter, selectedCourse, loadPayments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400">
            <Clock className="h-3 w-3" />
            {t("teacher.pending") || "Pending"}
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
            <CheckCircle className="h-3 w-3" />
            {t("teacher.approved") || "Approved"}
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
            <XCircle className="h-3 w-3" />
            {t("teacher.rejected") || "Rejected"}
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = async (paymentId: string) => {
    setApprovingId(paymentId);
    try {
      const result = await teacherApi.approvePayment(paymentId);
      if (result?.success) {
        toast.success("To'lov tasdiqlandi!");
        // Update the payment in the list
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: "approved" as const,
                  approvedAt: new Date().toISOString(),
                }
              : p
          )
        );
        teacherService.clearCachePattern("payments");
      } else {
        toast.error("To'lovni tasdiqlashda xatolik yuz berdi");
      }
    } catch {
      toast.error("To'lovni tasdiqlashda xatolik yuz berdi");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectModal.reason.trim()) {
      toast.error("Rad etish sababini kiriting");
      return;
    }

    setIsRejecting(true);
    try {
      const result = await teacherApi.rejectPayment(
        rejectModal.paymentId,
        rejectModal.reason.trim()
      );
      if (result?.success) {
        toast.success("To'lov rad etildi");
        // Update the payment in the list
        setPayments((prev) =>
          prev.map((p) =>
            p.id === rejectModal.paymentId
              ? {
                  ...p,
                  status: "rejected" as const,
                  rejectionReason: rejectModal.reason.trim(),
                }
              : p
          )
        );
        teacherService.clearCachePattern("payments");
        setRejectModal(null);
      } else {
        toast.error("To'lovni rad etishda xatolik yuz berdi");
      }
    } catch {
      toast.error("To'lovni rad etishda xatolik yuz berdi");
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("teacher.paymentsTitle") || "Payments"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("teacher.paymentsSubtitle") || "Payments for your courses"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">{t("teacher.allStatuses") || "All Statuses"}</option>
          <option value="pending">{t("teacher.pending") || "Pending"}</option>
          <option value="approved">
            {t("teacher.approved") || "Approved"}
          </option>
          <option value="rejected">
            {t("teacher.rejected") || "Rejected"}
          </option>
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-border bg-secondary px-4 py-2 text-foreground focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">{t("teacher.allCourses") || "All Courses"}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-secondary/50" />
                  <div className="h-3 w-24 rounded bg-secondary/50" />
                </div>
                <div className="h-6 w-20 rounded bg-secondary/50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {t("teacher.noPayments") || "No payments found"}
          </p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-foreground">
                      {payment.student.firstName} {payment.student.lastName}
                    </p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {payment.course.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {payment.student.phone} | {formatDate(payment.createdAt)}
                  </p>
                  {payment.rejectionReason && (
                    <p className="mt-2 text-sm text-red-400">
                      {t("teacher.reason") || "Reason"}:{" "}
                      {payment.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-foreground">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.checkImageUrl && (
                    <button
                      onClick={() => setSelectedImage(payment.checkImageUrl)}
                      className="flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <Eye className="h-4 w-4" />
                      {t("teacher.viewReceipt") || "Receipt"}
                    </button>
                  )}
                  {payment.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(payment.id)}
                        disabled={approvingId === payment.id}
                        className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {approvingId === payment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() =>
                          setRejectModal({ paymentId: payment.id, reason: "" })
                        }
                        disabled={approvingId === payment.id}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Rad etish
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("common.showing") || "Showing"}{" "}
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            {t("common.of") || "of"} {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous") || "Previous"}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
            >
              {t("common.next") || "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-foreground hover:text-foreground"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Payment receipt"
              className="max-h-[90vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-secondary p-6">
            <h3 className="text-lg font-semibold text-foreground">
              To&apos;lovni rad etish
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Rad etish sababini kiriting. Bu xabar talabaga yuboriladi.
            </p>

            <textarea
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
              placeholder="Rad etish sababi..."
              className="mt-4 w-full rounded-lg border border-border bg-background p-3 text-foreground placeholder-muted-foreground focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
              rows={3}
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal(null)}
                disabled={isRejecting}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectModal.reason.trim()}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
