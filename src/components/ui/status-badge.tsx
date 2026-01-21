"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  type StatusColor,
  getStatusBadgeClass,
  getStatusBadgeBorderClass,
  getGenericStatusColor,
  getUserStatusColor,
  getCourseStatusColor,
  getPaymentStatusColor,
  getAdviceStatusColor,
  type UserStatus,
  type CourseStatus,
  type PaymentStatus,
  type AdviceStatus,
} from "@/lib/status-colors";

export interface StatusBadgeProps {
  /** The status text to display */
  status: string;
  /** Explicit color override (optional - will auto-detect if not provided) */
  color?: StatusColor;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to show a border */
  withBorder?: boolean;
  /** Whether to capitalize the status text */
  capitalize?: boolean;
  /** Optional icon to show before the text */
  icon?: React.ReactNode;
  /** Additional className */
  className?: string;
}

const sizeClasses = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

/**
 * A reusable status badge component with auto-color detection
 *
 * @example
 * // Auto-detect color based on status
 * <StatusBadge status="active" />
 *
 * @example
 * // Explicit color
 * <StatusBadge status="Custom" color="purple" />
 *
 * @example
 * // With icon and border
 * <StatusBadge status="pending" icon={<Clock className="h-3 w-3" />} withBorder />
 */
export function StatusBadge({
  status,
  color,
  size = "sm",
  withBorder = false,
  capitalize = true,
  icon,
  className,
}: StatusBadgeProps) {
  const resolvedColor = color ?? getGenericStatusColor(status);
  const colorClass = withBorder
    ? getStatusBadgeBorderClass(resolvedColor)
    : getStatusBadgeClass(resolvedColor);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        withBorder && "border",
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {icon}
      {capitalize ? status.charAt(0).toUpperCase() + status.slice(1) : status}
    </span>
  );
}

// Typed variants for specific status types

export interface UserStatusBadgeProps extends Omit<StatusBadgeProps, "status" | "color"> {
  status: UserStatus;
}

export function UserStatusBadge({ status, ...props }: UserStatusBadgeProps) {
  return <StatusBadge status={status} color={getUserStatusColor(status)} {...props} />;
}

export interface CourseStatusBadgeProps extends Omit<StatusBadgeProps, "status" | "color"> {
  status: CourseStatus;
}

export function CourseStatusBadge({ status, ...props }: CourseStatusBadgeProps) {
  return <StatusBadge status={status} color={getCourseStatusColor(status)} {...props} />;
}

export interface PaymentStatusBadgeProps extends Omit<StatusBadgeProps, "status" | "color"> {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status, ...props }: PaymentStatusBadgeProps) {
  return <StatusBadge status={status} color={getPaymentStatusColor(status)} {...props} />;
}

export interface AdviceStatusBadgeProps extends Omit<StatusBadgeProps, "status" | "color"> {
  status: AdviceStatus;
}

export function AdviceStatusBadge({ status, ...props }: AdviceStatusBadgeProps) {
  return <StatusBadge status={status} color={getAdviceStatusColor(status)} {...props} />;
}

export default StatusBadge;
