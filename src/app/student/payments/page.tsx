"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { studentAPI, type StudentPayment } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export default function StudentPaymentsPage() {
  const t = useTranslations();
  const [payments, setPayments] = useState<StudentPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await studentAPI.getPayments();
      if (response.success && response.data) {
        setPayments(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load payments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  // Calculate stats
  const totalPayments = payments.length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const approvedPayments = payments.filter(
    (p) => p.status === "approved"
  ).length;
  const totalAmount = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Payments</h1>
        <p className="mt-1 text-gray-400">View your payment history</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-white">{totalPayments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingPayments}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/10 p-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-white">
                {approvedPayments}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button
              onClick={loadPayments}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && payments.length === 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-800 p-4">
              <CreditCard className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                No Payments Yet
              </h3>
              <p className="text-sm text-gray-400">
                Your payment history will appear here
              </p>
            </div>
            <Button
              asChild
              className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
            >
              <Link href="/student/courses">{t("course.browseCourses")}</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      {!error && payments.length > 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payments.map((payment) => {
              const status = statusConfig[payment.status];
              const StatusIcon = status.icon;

              return (
                <div
                  key={payment.id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-800 bg-gray-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gray-800 p-2">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">
                        {payment.courseName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {new Date(payment.createdAt).toLocaleDateString()} at{" "}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                      {payment.rejectionReason && (
                        <p className="mt-1 text-sm text-red-400">
                          Reason: {payment.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "flex items-center gap-1",
                        status.className
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {status.label}
                    </Badge>

                    {payment.receiptUrl && (
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                      >
                        <a
                          href={payment.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
