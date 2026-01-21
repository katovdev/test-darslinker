"use client";

import { useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/hooks/use-locale";
import { reviewService, type TransformedReview } from "@/services/reviews";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewFormProps {
  courseId: string;
  existingReview?: TransformedReview | null;
  onSuccess?: (review: TransformedReview) => void;
  onCancel?: () => void;
  className?: string;
}

export function ReviewForm({
  courseId,
  existingReview,
  onSuccess,
  onCancel,
  className,
}: ReviewFormProps) {
  const t = useTranslations();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;
  const canSubmit = rating > 0 && comment.trim().length >= 10;

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let response;

      if (isEditing) {
        response = await reviewService.updateReview(
          existingReview.id,
          { rating, comment },
          courseId
        );
      } else {
        response = await reviewService.createReview(courseId, {
          rating,
          comment,
        });
      }

      if (response.success && response.data) {
        toast.success(
          isEditing
            ? t("review.updated") || "Review updated"
            : t("review.submitted") || "Review submitted"
        );
        onSuccess?.(response.data);
        if (!isEditing) {
          setRating(0);
          setComment("");
        }
      } else {
        setError(response.error || t("common.error") || "Something went wrong");
        toast.error(
          response.error || t("common.error") || "Something went wrong"
        );
      }
    } catch {
      setError(t("common.error") || "Something went wrong");
      toast.error(t("common.error") || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-800/30 p-5",
        className
      )}
    >
      <h3 className="mb-4 text-lg font-semibold text-white">
        {isEditing
          ? t("review.editReview") || "Edit your review"
          : t("review.writeReview") || "Write a review"}
      </h3>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">
          {t("review.yourRating") || "Your rating"}
        </label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
        {rating === 0 && (
          <p className="mt-1 text-xs text-gray-500">
            {t("review.selectRating") || "Click to select a rating"}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-300">
          {t("review.yourComment") || "Your comment"}
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            t("review.commentPlaceholder") ||
            "Share your experience with this course..."
          }
          rows={4}
          className="resize-none border-gray-700 bg-gray-800/50 text-white placeholder-gray-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          {comment.length}/2000{" "}
          {comment.length < 10 &&
            `(${t("review.minChars") || "minimum 10 characters"})`}
        </p>
      </div>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            {t("common.cancel") || "Cancel"}
          </Button>
        )}
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.saving") || "Saving..."}
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              {isEditing
                ? t("review.updateReview") || "Update Review"
                : t("review.submitReview") || "Submit Review"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default ReviewForm;
