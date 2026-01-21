"use client";

import { useState, useEffect } from "react";
import { StarRating } from "@/components/ui/star-rating";
import { useTranslations } from "@/hooks/use-locale";
import { reviewService } from "@/services/reviews";
import type { RatingStats as RatingStatsType } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

interface RatingStatsProps {
  courseId: string;
  className?: string;
}

export function RatingStats({ courseId, className }: RatingStatsProps) {
  const t = useTranslations();
  const [stats, setStats] = useState<RatingStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      const response = await reviewService.getRatingStats(courseId);
      if (response.success && response.data) {
        setStats(response.data);
      }
      setIsLoading(false);
    };

    loadStats();
  }, [courseId]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-6",
          className
        )}
      >
        <div className="flex items-start gap-6">
          <div className="text-center">
            <div className="mb-2 h-12 w-16 rounded bg-gray-700" />
            <div className="h-4 w-20 rounded bg-gray-700/50" />
          </div>
          <div className="flex-1 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-4 rounded bg-gray-700/50" />
                <div className="h-2 flex-1 rounded bg-gray-700/50" />
                <div className="h-3 w-8 rounded bg-gray-700/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-gray-800 bg-gray-800/30 p-6 text-center",
          className
        )}
      >
        <StarRating rating={0} size="lg" className="mb-2 justify-center" />
        <p className="text-gray-400">
          {t("review.noRatingsYet") || "No ratings yet"}
        </p>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(stats.distribution));

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-800/30 p-6",
        className
      )}
    >
      <div className="flex items-start gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-white">
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating
            rating={stats.averageRating}
            size="sm"
            className="my-2 justify-center"
          />
          <p className="text-sm text-gray-400">
            {stats.totalReviews}{" "}
            {stats.totalReviews === 1
              ? t("review.review") || "review"
              : t("review.reviews") || "reviews"}
          </p>
        </div>

        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star as 1 | 2 | 3 | 4 | 5];
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="w-3 text-sm text-gray-400">{star}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-yellow-400 transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-gray-400">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingStats;
