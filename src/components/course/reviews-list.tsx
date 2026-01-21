"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";
import { ReviewCard } from "./review-card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-locale";
import { reviewService, type TransformedReview } from "@/services/reviews";
import { cn } from "@/lib/utils";

interface ReviewsListProps {
  courseId: string;
  currentUserId?: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
  onEdit?: (review: TransformedReview) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
  className?: string;
}

export function ReviewsList({
  courseId,
  currentUserId,
  isTeacher = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onRespond,
  className,
}: ReviewsListProps) {
  const t = useTranslations();
  const [reviews, setReviews] = useState<TransformedReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"createdAt" | "rating">("createdAt");
  const [refreshKey, setRefreshKey] = useState(0);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    let cancelled = false;

    const fetchReviews = async () => {
      if (!isMounted.current) return;
      setIsLoading(true);

      const response = await reviewService.getReviews(courseId, {
        page,
        limit: 10,
        sortBy,
        sortOrder: "desc",
      });

      if (cancelled || !isMounted.current) return;

      if (response.success) {
        setReviews(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }
      }
      setIsLoading(false);
    };

    fetchReviews();

    return () => {
      cancelled = true;
      isMounted.current = false;
    };
  }, [courseId, page, sortBy, refreshKey]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleDeleteReview = async (reviewId: string) => {
    if (onDelete) {
      onDelete(reviewId);
    }
    triggerRefresh();
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-5"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-700" />
                <div className="h-3 w-24 rounded bg-gray-700/50" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-700/50" />
              <div className="h-4 w-3/4 rounded bg-gray-700/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-gray-800 bg-gray-800/30 py-12 text-center",
          className
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-700/50">
          <MessageSquareText className="h-7 w-7 text-gray-500" />
        </div>
        <h3 className="mb-2 font-medium text-white">
          {t("review.noReviews") || "No reviews yet"}
        </h3>
        <p className="text-sm text-gray-400">
          {t("review.beFirstToReview") || "Be the first to leave a review"}
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">
          {t("review.sortBy") || "Sort by"}:
        </span>
        <div className="flex gap-2">
          <Button
            variant={sortBy === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("createdAt")}
          >
            {t("review.newest") || "Newest"}
          </Button>
          <Button
            variant={sortBy === "rating" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("rating")}
          >
            {t("review.highestRated") || "Highest Rated"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isOwner={currentUserId === review.student.id}
            isTeacher={isTeacher}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={handleDeleteReview}
            onRespond={onRespond}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            {t("common.previous") || "Previous"}
          </Button>
          <span className="px-4 text-sm text-gray-400">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            {t("common.next") || "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReviewsList;
