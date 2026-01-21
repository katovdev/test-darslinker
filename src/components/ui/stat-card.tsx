"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type StatCardColor =
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "yellow"
  | "red"
  | "gray"
  | "emerald"
  | "teal";

export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color?: StatCardColor;
  isLarge?: boolean;
  className?: string;
}

const colorClasses: Record<StatCardColor, string> = {
  blue: "bg-blue-500/10 text-blue-400",
  green: "bg-green-500/10 text-green-400",
  purple: "bg-purple-500/10 text-purple-400",
  orange: "bg-orange-500/10 text-orange-400",
  yellow: "bg-yellow-500/10 text-yellow-400",
  red: "bg-red-500/10 text-red-400",
  gray: "bg-gray-500/10 text-gray-400",
  emerald: "bg-emerald-500/10 text-emerald-400",
  teal: "bg-teal-500/10 text-teal-400",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  color = "blue",
  isLarge = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-800/30 p-6 transition-colors hover:border-gray-700",
        isLarge && "sm:col-span-2",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
          colorClasses[color]
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

export interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  className,
}: StatCardGridProps) {
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
      {children}
    </div>
  );
}

export default StatCard;
