/**
 * Centralized status color configuration for consistent badge/pill styling
 * across the application.
 */

export type StatusColor =
  | "green"
  | "yellow"
  | "red"
  | "blue"
  | "purple"
  | "orange"
  | "gray"
  | "teal"
  | "emerald";

export interface StatusColorClasses {
  /** Background + text color classes (e.g., "bg-green-500/10 text-green-400") */
  base: string;
  /** Border color class (e.g., "border-green-500/30") */
  border: string;
  /** Hover background class (e.g., "hover:bg-green-500/20") */
  hover: string;
  /** Combined classes for badge/pill usage */
  badge: string;
  /** Combined classes with border */
  badgeBorder: string;
}

const colorClasses: Record<StatusColor, StatusColorClasses> = {
  green: {
    base: "bg-green-500/10 text-green-400",
    border: "border-green-500/30",
    hover: "hover:bg-green-500/20",
    badge: "bg-green-500/10 text-green-400",
    badgeBorder: "bg-green-500/10 text-green-400 border-green-500/30",
  },
  yellow: {
    base: "bg-yellow-500/10 text-yellow-400",
    border: "border-yellow-500/30",
    hover: "hover:bg-yellow-500/20",
    badge: "bg-yellow-500/10 text-yellow-400",
    badgeBorder: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  },
  red: {
    base: "bg-red-500/10 text-red-400",
    border: "border-red-500/30",
    hover: "hover:bg-red-500/20",
    badge: "bg-red-500/10 text-red-400",
    badgeBorder: "bg-red-500/10 text-red-400 border-red-500/30",
  },
  blue: {
    base: "bg-blue-500/10 text-blue-400",
    border: "border-blue-500/30",
    hover: "hover:bg-blue-500/20",
    badge: "bg-blue-500/10 text-blue-400",
    badgeBorder: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  purple: {
    base: "bg-purple-500/10 text-purple-400",
    border: "border-purple-500/30",
    hover: "hover:bg-purple-500/20",
    badge: "bg-purple-500/10 text-purple-400",
    badgeBorder: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  orange: {
    base: "bg-orange-500/10 text-orange-400",
    border: "border-orange-500/30",
    hover: "hover:bg-orange-500/20",
    badge: "bg-orange-500/10 text-orange-400",
    badgeBorder: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  },
  gray: {
    base: "bg-gray-500/10 text-gray-400",
    border: "border-gray-500/30",
    hover: "hover:bg-gray-500/20",
    badge: "bg-gray-500/10 text-gray-400",
    badgeBorder: "bg-gray-500/10 text-gray-400 border-gray-500/30",
  },
  teal: {
    base: "bg-teal-500/10 text-teal-400",
    border: "border-teal-500/30",
    hover: "hover:bg-teal-500/20",
    badge: "bg-teal-500/10 text-teal-400",
    badgeBorder: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  },
  emerald: {
    base: "bg-emerald-500/10 text-emerald-400",
    border: "border-emerald-500/30",
    hover: "hover:bg-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400",
    badgeBorder: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
};

/**
 * Get the full color classes for a status color
 */
export function getStatusColorClasses(color: StatusColor): StatusColorClasses {
  return colorClasses[color];
}

/**
 * Get badge classes for a status color (background + text)
 */
export function getStatusBadgeClass(color: StatusColor): string {
  return colorClasses[color].badge;
}

/**
 * Get badge classes with border for a status color
 */
export function getStatusBadgeBorderClass(color: StatusColor): string {
  return colorClasses[color].badgeBorder;
}

// Common status mappings used across the app

export type UserStatus = "active" | "pending" | "blocked" | "inactive";
export type CourseStatus = "draft" | "pending" | "approved" | "active" | "rejected" | "archived";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded" | "cancelled";
export type AdviceStatus = "pending" | "contacted" | "resolved";

/**
 * Get color for user account status
 */
export function getUserStatusColor(status: UserStatus): StatusColor {
  const mapping: Record<UserStatus, StatusColor> = {
    active: "green",
    pending: "yellow",
    blocked: "red",
    inactive: "gray",
  };
  return mapping[status] || "gray";
}

/**
 * Get color for course status
 */
export function getCourseStatusColor(status: CourseStatus): StatusColor {
  const mapping: Record<CourseStatus, StatusColor> = {
    draft: "gray",
    pending: "yellow",
    approved: "blue",
    active: "green",
    rejected: "red",
    archived: "gray",
  };
  return mapping[status] || "gray";
}

/**
 * Get color for payment status
 */
export function getPaymentStatusColor(status: PaymentStatus): StatusColor {
  const mapping: Record<PaymentStatus, StatusColor> = {
    pending: "yellow",
    completed: "green",
    failed: "red",
    refunded: "purple",
    cancelled: "gray",
  };
  return mapping[status] || "gray";
}

/**
 * Get color for advice/consultation status
 */
export function getAdviceStatusColor(status: AdviceStatus): StatusColor {
  const mapping: Record<AdviceStatus, StatusColor> = {
    pending: "yellow",
    contacted: "blue",
    resolved: "green",
  };
  return mapping[status] || "gray";
}

/**
 * Generic status color getter - tries to match common status names
 */
export function getGenericStatusColor(status: string): StatusColor {
  const lowercased = status.toLowerCase();

  // Success states
  if (["active", "approved", "completed", "resolved", "success", "published", "verified"].includes(lowercased)) {
    return "green";
  }

  // Warning/pending states
  if (["pending", "processing", "waiting", "draft", "review"].includes(lowercased)) {
    return "yellow";
  }

  // Error states
  if (["blocked", "failed", "rejected", "error", "cancelled", "expired", "suspended"].includes(lowercased)) {
    return "red";
  }

  // Info states
  if (["contacted", "in_progress", "scheduled", "info"].includes(lowercased)) {
    return "blue";
  }

  // Default
  return "gray";
}

export default colorClasses;
