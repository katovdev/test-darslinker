"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-6",
        className
      )}
    >
      <div className="mb-4 h-10 w-10 rounded-lg bg-gray-700/50" />
      <div className="mb-2 h-4 w-20 rounded bg-gray-700/50" />
      <div className="h-8 w-16 rounded bg-gray-700/50" />
    </div>
  );
}

export interface SkeletonGridProps {
  count?: number;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function SkeletonGrid({
  count = 8,
  columns = 4,
  className,
}: SkeletonGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        columns === 5 && "sm:grid-cols-2 lg:grid-cols-5",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export interface SkeletonTableRowProps {
  columns?: number;
  className?: string;
}

export function SkeletonTableRow({
  columns = 5,
  className,
}: SkeletonTableRowProps) {
  return (
    <tr className={cn("animate-pulse", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-gray-700/50" />
        </td>
      ))}
    </tr>
  );
}

export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function SkeletonTable({
  rows = 5,
  columns = 5,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl border border-gray-800 bg-gray-800/30",
        className
      )}
    >
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-3 text-left">
                <div className="h-4 w-20 rounded bg-gray-700/50" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SkeletonCard;
