"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-locale";
import { teacherAPI, type TeacherPayment } from "@/lib/api";
import { toast } from "sonner";
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

export default function TeacherPaymentsPage() {
  const t = useTranslations();
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Action dialog state
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [selectedPayment, setSelectedPayment] = useState<TeacherPayment | null>(
    null
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getPayments({
        status:
          statusFilter !== "all"
            ? (statusFilter as "pending" | "approved" | "rejected")
            : undefined,
      });
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
  }, [statusFilter]);

  const openActionDialog = (
    payment: TeacherPayment,
    type: "approve" | "reject"
  ) => {
    setSelectedPayment(payment);
    setActionType(type);
    setRejectionReason("");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedPayment) return;

    setIsProcessing(true);

    try {
      if (actionType === "approve") {
        await teacherAPI.approvePayment(selectedPayment.id);
        toast.success(t("teacher.paymentApproved"));
      } else {
        await teacherAPI.rejectPayment(selectedPayment.id, rejectionReason);
        toast.success(t("teacher.paymentRejected"));
      }

      // Update the payment in local state
      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id
            ? {
                ...p,
                status: actionType === "approve" ? "approved" : "rejected",
                rejectionReason:
                  actionType === "reject" ? rejectionReason : null,
                reviewedAt: new Date().toISOString(),
              }
            : p
        )
      );

      setActionDialogOpen(false);
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to process payment:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const pendingCount = payments.filter((p) => p.status === "pending").length;
  const approvedCount = payments.filter((p) => p.status === "approved").length;
  const totalRevenue = payments
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amount, 0);

  // Loading state
  if (isLoading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-gray-700" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
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
        <h1 className="text-2xl font-bold text-white">
          {t("teacher.payments")}
        </h1>
        <p className="mt-1 text-gray-400">{t("teacher.managePayments")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("teacher.pending")}</p>
              <p className="text-xl font-bold text-white">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("teacher.approved")}</p>
              <p className="text-xl font-bold text-white">{approvedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalRevenue")}
              </p>
              <p className="text-xl font-bold text-white">
                {totalRevenue.toLocaleString()} UZS
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-gray-700 bg-gray-800 text-white">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder={t("teacher.filterByStatus")} />
          </SelectTrigger>
          <SelectContent className="border-gray-800 bg-gray-900">
            <SelectItem value="all">{t("teacher.allPayments")}</SelectItem>
            <SelectItem value="pending">{t("teacher.pending")}</SelectItem>
            <SelectItem value="approved">{t("teacher.approved")}</SelectItem>
            <SelectItem value="rejected">{t("teacher.rejected")}</SelectItem>
          </SelectContent>
        </Select>
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
                {t("teacher.noPayments")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("teacher.noPaymentsDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payments List */}
      {!error && payments.length > 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">
              {t("teacher.paymentHistory")}
            </CardTitle>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium text-white">
                          {payment.student.firstName} {payment.student.lastName}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {payment.course.title}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{payment.student.phone}</span>
                      <span>•</span>
                      <span>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {payment.rejectionReason && (
                      <p className="mt-2 text-sm text-red-400">
                        {t("teacher.reason")}: {payment.rejectionReason}
                      </p>
                    )}
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
                      {t(`teacher.paymentStatus.${payment.status}`)}
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

                    {payment.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openActionDialog(payment, "approve")}
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          {t("teacher.approve")}
                        </Button>
                        <Button
                          onClick={() => openActionDialog(payment, "reject")}
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600/10"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          {t("teacher.reject")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {actionType === "approve"
                ? t("teacher.approvePayment")
                : t("teacher.rejectPayment")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {actionType === "approve"
                ? t("teacher.approvePaymentDesc")
                : t("teacher.rejectPaymentDesc")}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="rounded-lg bg-gray-800/50 p-4">
              <p className="font-medium text-white">
                {selectedPayment.student.firstName}{" "}
                {selectedPayment.student.lastName}
              </p>
              <p className="text-sm text-gray-400">
                {selectedPayment.course.title}
              </p>
              <p className="mt-2 text-lg font-bold text-white">
                {selectedPayment.amount.toLocaleString()}{" "}
                {selectedPayment.currency}
              </p>
            </div>
          )}

          {actionType === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-300">
                {t("teacher.rejectionReason")}
              </Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t("teacher.rejectionReasonPlaceholder")}
                className="border-gray-700 bg-gray-800 text-white"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAction}
              disabled={isProcessing}
              className={
                actionType === "approve"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-red-600 text-white hover:bg-red-700"
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.loading")}
                </>
              ) : actionType === "approve" ? (
                t("teacher.approve")
              ) : (
                t("teacher.reject")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
