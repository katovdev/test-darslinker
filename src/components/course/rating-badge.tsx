"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseRatingBadgeProps {
  rating: number;
  reviewCount?: number;
  showCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "text-xs",
    star: "h-3 w-3",
  },
  md: {
    container: "text-sm",
    star: "h-4 w-4",
  },
  lg: {
    container: "text-base",
    star: "h-5 w-5",
  },
};

export function CourseRatingBadge({
  rating,
  reviewCount,
  showCount = true,
  size = "md",
  className,
}: CourseRatingBadgeProps) {
  if (rating === 0 && (!reviewCount || reviewCount === 0)) {
    return null;
  }

  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-yellow-400/10 px-2 py-1",
        sizeClass.container,
        className
      )}
    >
      <Star className={cn("fill-yellow-400 text-yellow-400", sizeClass.star)} />
      <span className="font-semibold text-yellow-400">{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-gray-400">({reviewCount})</span>
      )}
    </div>
  );
}

export default CourseRatingBadge;
