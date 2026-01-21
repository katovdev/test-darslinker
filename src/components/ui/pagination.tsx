"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Label for "Page X of Y" (default: "Page") */
  pageLabel?: string;
  /** Label for "of" in "Page X of Y" (default: "of") */
  ofLabel?: string;
  /** Additional className */
  className?: string;
}

/**
 * Simple pagination with prev/next buttons
 *
 * @example
 * <Pagination
 *   page={currentPage}
 *   totalPages={10}
 *   onPageChange={setCurrentPage}
 * />
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  pageLabel = "Page",
  ofLabel = "of",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl border border-gray-800 bg-gray-800/30 px-4 py-3",
        className
      )}
    >
      <p className="text-sm text-gray-400">
        {pageLabel} {page} {ofLabel} {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
