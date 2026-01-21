"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-400">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

export interface RefreshButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  label?: string;
  className?: string;
}

export function RefreshButton({
  onClick,
  isLoading = false,
  label = "Refresh",
  className,
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50",
        className
      )}
    >
      <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
      {label}
    </button>
  );
}

export interface SectionHeaderProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {children}
    </div>
  );
}

export default PageHeader;
