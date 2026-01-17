"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  Globe,
  Send,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useTranslations } from "@/hooks/use-locale";
import { adminAPI, type TeacherRequest } from "@/lib/api";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminRequestsPage() {
  const t = useTranslations();
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [selectedRequest, setSelectedRequest] = useState<TeacherRequest | null>(
    null
  );

  // Dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getTeacherRequests({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (response.success && response.data) {
        setRequests(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await adminAPI.approveRequest(selectedRequest.id);
      if (response.success) {
        toast.success(t("admin.requestApproved"));
        setApproveDialogOpen(false);
        setSelectedRequest(null);
        loadRequests();
      }
    } catch (err) {
      console.error("Failed to approve request:", err);
      toast.error(t("errors.generalError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const response = await adminAPI.rejectRequest(
        selectedRequest.id,
        rejectionReason || undefined
      );
      if (response.success) {
        toast.success(t("admin.requestRejected"));
        setRejectDialogOpen(false);
        setSelectedRequest(null);
        setRejectionReason("");
        loadRequests();
      }
    } catch (err) {
      console.error("Failed to reject request:", err);
      toast.error(t("errors.generalError"));
    } finally {
      setIsProcessing(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            {t("admin.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            {t("admin.rejected")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">
            <Clock className="mr-1 h-3 w-3" />
            {t("admin.pending")}
          </Badge>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40 bg-gray-700" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <UserPlus className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadRequests}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("admin.requests")}</h1>
        <p className="mt-1 text-gray-400">{t("admin.requestsSubtitle")}</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-40 border-gray-700 bg-gray-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="all" className="text-gray-300">
              {t("admin.allRequests")}
            </SelectItem>
            <SelectItem value="pending" className="text-gray-300">
              {t("admin.pending")}
            </SelectItem>
            <SelectItem value="approved" className="text-gray-300">
              {t("admin.approved")}
            </SelectItem>
            <SelectItem value="rejected" className="text-gray-300">
              {t("admin.rejected")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-700/50 p-4">
              <UserPlus className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("admin.noRequests")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("admin.noRequestsDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-gray-800 bg-gray-800/30">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                      <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                        {getInitials(
                          request.user.firstName,
                          request.user.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {request.user.firstName} {request.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{request.username} • {request.user.phone}
                      </p>
                      {request.businessName && (
                        <p className="text-sm text-gray-400">
                          {request.businessName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-3">
                    {getStatusBadge(request.status)}
                    <p className="text-xs text-gray-500">
                      {new Date(request.requestedAt).toLocaleDateString()}
                    </p>
                    {request.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setApproveDialogOpen(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="mr-1 h-4 w-4" />
                          {t("admin.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectDialogOpen(true);
                          }}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          {t("admin.reject")}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Info */}
                {(request.bio || request.socialLinks) && (
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    {request.bio && (
                      <p className="mb-3 text-sm text-gray-400">
                        {request.bio}
                      </p>
                    )}
                    {request.socialLinks && (
                      <div className="flex flex-wrap gap-3">
                        {request.socialLinks.website && (
                          <a
                            href={request.socialLinks.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                        {request.socialLinks.telegram && (
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Send className="h-4 w-4" />
                            {request.socialLinks.telegram}
                          </span>
                        )}
                        {request.socialLinks.instagram && (
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Instagram className="h-4 w-4" />
                            {request.socialLinks.instagram}
                          </span>
                        )}
                        {request.socialLinks.youtube && (
                          <span className="flex items-center gap-1 text-sm text-gray-400">
                            <Youtube className="h-4 w-4" />
                            {request.socialLinks.youtube}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection reason */}
                {request.status === "rejected" && request.rejectionReason && (
                  <div className="mt-4 rounded-lg bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">
                      <strong>{t("admin.rejectionReason")}:</strong>{" "}
                      {request.rejectionReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.approveRequest")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t("admin.approveRequestDesc", {
                name: selectedRequest
                  ? `${selectedRequest.user.firstName} ${selectedRequest.user.lastName}`
                  : "",
                username: selectedRequest?.username || "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("admin.approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="border-gray-800 bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("admin.rejectRequest")}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {t("admin.rejectRequestDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t("admin.rejectionReasonPlaceholder")}
              rows={3}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason("");
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("admin.reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
