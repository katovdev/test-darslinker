"use client";

import { useState } from "react";
import { User, MessageSquare, MoreVertical, Edit, Trash2 } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "@/hooks/use-locale";
import { cn } from "@/lib/utils";
import type { TransformedReview } from "@/services/reviews";

interface ReviewCardProps {
  review: TransformedReview;
  isOwner?: boolean;
  isTeacher?: boolean;
  isAdmin?: boolean;
  onEdit?: (review: TransformedReview) => void;
  onDelete?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
  className?: string;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? "Just now" : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function ReviewCard({
  review,
  isOwner = false,
  isTeacher = false,
  isAdmin = false,
  onEdit,
  onDelete,
  onRespond,
  className,
}: ReviewCardProps) {
  const t = useTranslations();
  const showActions = isOwner || isTeacher || isAdmin;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-800/30 p-5",
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {review.student.avatar ? (
            <img
              src={review.student.avatar}
              alt={review.student.fullName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
              <User className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-white">{review.student.fullName}</p>
            <p className="text-sm text-gray-500">
              {formatRelativeDate(review.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(review)}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t("common.edit") || "Edit"}
                  </DropdownMenuItem>
                )}
                {(isOwner || isAdmin) && onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(review.id)}
                    className="text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("common.delete") || "Delete"}
                  </DropdownMenuItem>
                )}
                {isTeacher && !review.teacherResponse && onRespond && (
                  <DropdownMenuItem onClick={() => onRespond(review.id)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    {t("review.respond") || "Respond"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <p className="mb-4 whitespace-pre-wrap text-gray-300">{review.comment}</p>

      {review.teacherResponse && (
        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              {t("review.teacherResponse") || "Teacher Response"}
            </span>
            {review.teacherRespondedAt && (
              <span className="text-xs text-gray-500">
                {formatRelativeDate(review.teacherRespondedAt)}
              </span>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap text-gray-300">
            {review.teacherResponse}
          </p>
        </div>
      )}
    </div>
  );
}

export default ReviewCard;
