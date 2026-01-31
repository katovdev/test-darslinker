"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  ArrowLeft,
  ImageIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-locale";
import { studentService } from "@/services/student";
import type { StudentPayment } from "@/lib/api/student";
import type { Pagination } from "@/lib/api/teacher";

export default function StudentPaymentsPage() {
  const t = useTranslations();
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await studentService.listPayments({
        page,
        limit: 20,
        status:
          (statusFilter as "pending" | "approved" | "rejected") || undefined,
      });

      if (data) {
        setPayments(data.payments);
        setPagination(data.pagination);
      } else {
        setError("To'lovlarni yuklashda xatolik yuz berdi");
      }
    } catch {
      setError("To'lovlarni yuklashda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [page, statusFilter]);

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
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-medium text-yellow-400">
            <Clock className="h-4 w-4" />
            Kutilmoqda
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm font-medium text-green-400">
            <CheckCircle className="h-4 w-4" />
            Tasdiqlangan
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-400">
            <XCircle className="h-4 w-4" />
            Rad etilgan
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/me">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-border bg-secondary/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">
            Mening to&apos;lovlarim
          </h1>
          <p className="mt-1 text-muted-foreground">
            Kurslar uchun to&apos;lovlar tarixi
          </p>
        </div>
        <Button
          onClick={loadPayments}
          disabled={isLoading}
          variant="outline"
          className="border-border bg-secondary/50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="ml-2 hidden sm:inline">Yangilash</span>
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:w-auto"
          >
            <option value="">Barcha holatlar</option>
            <option value="pending">Kutilmoqda</option>
            <option value="approved">Tasdiqlangan</option>
            <option value="rejected">Rad etilgan</option>
          </select>
        </CardContent>
      </Card>

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="animate-pulse border-border bg-card"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-secondary/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-secondary/50" />
                    <div className="h-3 w-1/3 rounded bg-secondary/50" />
                  </div>
                  <div className="h-6 w-24 rounded bg-secondary/50" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && payments.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              To&apos;lovlar topilmadi
            </h3>
            <p className="mt-2 text-muted-foreground">
              Siz hali hech qanday kurs uchun to&apos;lov qilmadingiz
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && payments.length > 0 && (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card
              key={payment.id}
              className="border-border bg-card transition-colors hover:border-primary/30"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {payment.course.thumbnail ? (
                    <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      <img
                        src={payment.course.thumbnail}
                        alt={payment.course.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium text-foreground">
                      {payment.course.title}
                    </h3>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(payment.status)}
                    {payment.checkImageUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedImage(payment.checkImageUrl)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        Chek
                      </Button>
                    )}
                  </div>
                </div>

                {payment.status === "rejected" && payment.rejectionReason && (
                  <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">
                      <span className="font-medium">Rad etilish sababi:</span>{" "}
                      {payment.rejectionReason}
                    </p>
                  </div>
                )}

                {payment.status === "approved" && (
                  <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                    <p className="text-sm text-green-400">
                      Kursga kirish ochildi!{" "}
                      <Link
                        href={`/courses/${payment.course.slug}`}
                        className="underline hover:no-underline"
                      >
                        Kursga o&apos;tish
                      </Link>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)} /{" "}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
              className="border-border bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Oldingi
            </Button>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              variant="outline"
              size="sm"
              className="border-border bg-secondary"
            >
              Keyingi
              <ChevronRight className="h-4 w-4" />
            </Button>
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
              alt="Payment check"
              className="max-h-[90vh] rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
