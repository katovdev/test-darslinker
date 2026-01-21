"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { teacherService } from "@/services/teacher";
import type { TeacherPayment, TeacherCourse, Pagination } from "@/lib/api/teacher";

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

  const loadCourses = async () => {
    try {
      const data = await teacherService.listCourses({ limit: 100 });
      if (data) {
        setCourses(data.courses);
      }
    } catch {
      // Silent fail
    }
  };

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await teacherService.listPayments({
        page,
        limit: 20,
        status: (statusFilter as "pending" | "approved" | "rejected") || undefined,
        courseId: selectedCourse || undefined,
      });

      if (data) {
        setPayments(data.payments);
        setPagination(data.pagination);
      } else {
        setError(t("teacher.paymentsLoadError") || "Failed to load payments");
      }
    } catch {
      setError(t("teacher.paymentsLoadError") || "Failed to load payments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter, selectedCourse]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("teacher.paymentsTitle") || "Payments"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("teacher.paymentsSubtitle") || "Payments for your courses"}
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

      <div className="flex flex-col gap-4 sm:flex-row">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">{t("teacher.allStatuses") || "All Statuses"}</option>
          <option value="pending">{t("teacher.pending") || "Pending"}</option>
          <option value="approved">{t("teacher.approved") || "Approved"}</option>
          <option value="rejected">{t("teacher.rejected") || "Rejected"}</option>
        </select>

        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
              className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-700/50" />
                  <div className="h-3 w-24 rounded bg-gray-700/50" />
                </div>
                <div className="h-6 w-20 rounded bg-gray-700/50" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-12 text-center">
          <CreditCard className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">
            {t("teacher.noPayments") || "No payments found"}
          </p>
        </div>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-colors hover:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-white">
                      {payment.student.firstName} {payment.student.lastName}
                    </p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    {payment.course.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {payment.student.phone} | {formatDate(payment.createdAt)}
                  </p>
                  {payment.rejectionReason && (
                    <p className="mt-2 text-sm text-red-400">
                      {t("teacher.reason") || "Reason"}: {payment.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(payment.amount)}
                  </p>
                  {payment.checkImageUrl && (
                    <button
                      onClick={() => setSelectedImage(payment.checkImageUrl)}
                      className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                    >
                      <Eye className="h-4 w-4" />
                      {t("teacher.viewReceipt") || "Receipt"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {t("common.showing") || "Showing"} {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            {t("common.of") || "of"} {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous") || "Previous"}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
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
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
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
    </div>
  );
}
