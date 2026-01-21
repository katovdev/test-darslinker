"use client";

import * as React from "react";
import { FileQuestion, Search, AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateVariant = "default" | "no-results" | "error" | "no-data";

export interface EmptyStateProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Predefined variant */
  variant?: EmptyStateVariant;
  /** Optional action button */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }
> = {
  default: {
    icon: Inbox,
    title: "No items",
    description: "There are no items to display.",
  },
  "no-results": {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  error: {
    icon: AlertCircle,
    title: "Something went wrong",
    description: "Failed to load data. Please try again.",
  },
  "no-data": {
    icon: FileQuestion,
    title: "No data available",
    description: "There is no data to display yet.",
  },
};

/**
 * Empty state display for lists and tables
 *
 * @example
 * // Using variant
 * <EmptyState variant="no-results" />
 *
 * @example
 * // Custom content
 * <EmptyState
 *   icon={<Users className="h-12 w-12" />}
 *   title="No users found"
 *   description="Add your first user to get started"
 *   action={<Button>Add User</Button>}
 * />
 */
export function EmptyState({
  title,
  description,
  icon,
  variant = "default",
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const displayIcon = icon ?? <IconComponent className="h-12 w-12" />;
  const displayTitle = title ?? config.title;
  const displayDescription = description ?? config.description;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-800/30 p-8 text-center",
        className
      )}
    >
      <div className="mx-auto text-gray-600">{displayIcon}</div>
      <p className="mt-4 font-medium text-gray-400">{displayTitle}</p>
      {displayDescription && (
        <p className="mt-1 text-sm text-gray-500">{displayDescription}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
