"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
  GraduationCap,
  BarChart3,
  ClipboardList,
  Star,
  UserCog,
  Layout,
  Palette,
  TrendingUp,
  MessageSquare,
  Bell,
  Trophy,
  Target,
} from "lucide-react";
import type { NavItem } from "./collapsible-sidebar";
import type { User } from "@/context/auth-context";

/**
 * Get navigation items based on user role
 */
export function getDashboardNavigation(
  user: User | null,
  t: (key: string) => string
): NavItem[] {
  if (!user) return [];

  const role = user.role;

  // Student Navigation
  if (role === "student") {
    return [
      {
        href: "/dashboard",
        label: t("dashboard.home") || "Home",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/courses",
        label: t("dashboard.myCourses") || "My Courses",
        icon: BookOpen,
      },
      {
        href: "/dashboard/progress",
        label: t("dashboard.progress") || "Progress",
        icon: TrendingUp,
      },
      {
        href: "/dashboard/blog",
        label: t("dashboard.blog") || "Blog",
        icon: FileText,
      },
      {
        href: "/dashboard/achievements",
        label: t("dashboard.achievements") || "Achievements",
        icon: Trophy,
      },
      {
        href: "/dashboard/notifications",
        label: t("dashboard.notifications") || "Notifications",
        icon: Bell,
      },
      {
        href: "/dashboard/profile",
        label: t("dashboard.profile") || "Profile",
        icon: UserCog,
      },
    ];
  }

  // Teacher Navigation
  if (role === "teacher") {
    return [
      {
        href: "/dashboard",
        label: t("dashboard.home") || "Home",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/courses",
        label: t("dashboard.courses") || "Courses",
        icon: BookOpen,
      },
      {
        href: "/dashboard/students",
        label: t("dashboard.students") || "Students",
        icon: Users,
      },
      {
        href: "/dashboard/assignments",
        label: t("dashboard.assignments") || "Assignments",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/analytics",
        label: t("dashboard.analytics") || "Analytics",
        icon: BarChart3,
      },
      {
        href: "/dashboard/quiz-analytics",
        label: t("dashboard.quizAnalytics") || "Quiz Analytics",
        icon: Target,
      },
      {
        href: "/dashboard/student-analytics",
        label: t("dashboard.studentAnalytics") || "Student Analytics",
        icon: GraduationCap,
      },
      {
        href: "/dashboard/reviews",
        label: t("dashboard.reviews") || "Reviews",
        icon: Star,
      },
      {
        href: "/dashboard/payments",
        label: t("dashboard.payments") || "Payments",
        icon: CreditCard,
      },
      {
        href: "/dashboard/earnings",
        label: t("dashboard.earnings") || "Earnings",
        icon: DollarSign,
      },
      {
        href: "/dashboard/blog",
        label: t("dashboard.blog") || "Blog",
        icon: FileText,
      },
      {
        href: "/dashboard/profile",
        label: t("dashboard.profile") || "Profile",
        icon: UserCog,
      },
    ];
  }

  // Moderator Navigation (everything except payments and earnings)
  if (role === "moderator") {
    return [
      {
        href: "/dashboard",
        label: t("dashboard.home") || "Home",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/users",
        label: t("dashboard.users") || "Users",
        icon: Users,
      },
      {
        href: "/dashboard/teachers",
        label: t("dashboard.teachers") || "Teachers",
        icon: GraduationCap,
      },
      {
        href: "/dashboard/courses",
        label: t("dashboard.courses") || "Courses",
        icon: BookOpen,
      },
      {
        href: "/dashboard/blog",
        label: t("dashboard.blog") || "Blog",
        icon: FileText,
      },
      {
        href: "/dashboard/advice",
        label: t("dashboard.advice") || "Advice",
        icon: MessageSquare,
      },
      {
        href: "/dashboard/settings",
        label: t("dashboard.settings") || "Settings",
        icon: Settings,
      },
    ];
  }

  // Admin Navigation (everything)
  if (role === "admin") {
    return [
      {
        href: "/dashboard",
        label: t("dashboard.home") || "Home",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/users",
        label: t("dashboard.users") || "Users",
        icon: Users,
      },
      {
        href: "/dashboard/courses",
        label: t("dashboard.courses") || "Courses",
        icon: BookOpen,
      },
      {
        href: "/dashboard/payments",
        label: t("dashboard.payments") || "Payments",
        icon: CreditCard,
      },
      {
        href: "/dashboard/earnings",
        label: t("dashboard.earnings") || "Earnings",
        icon: DollarSign,
      },
      {
        href: "/dashboard/blog",
        label: t("dashboard.blog") || "Blog",
        icon: FileText,
      },
      {
        href: "/dashboard/landing-page",
        label: t("dashboard.landingPage") || "Landing Page",
        icon: Layout,
      },
      {
        href: "/dashboard/theme",
        label: t("dashboard.theme") || "Theme",
        icon: Palette,
      },
      {
        href: "/dashboard/settings",
        label: t("dashboard.settings") || "Settings",
        icon: Settings,
      },
    ];
  }

  return [];
}

/**
 * Get theme color based on user role
 */
export function getRoleTheme(
  role: "student" | "teacher" | "moderator" | "admin"
): "blue" | "green" | "emerald" | "purple" | "orange" | "teal" {
  switch (role) {
    case "admin":
      return "blue";
    case "moderator":
      return "green";
    case "teacher":
      return "emerald";
    case "student":
      return "purple";
    default:
      return "blue";
  }
}

/**
 * Get dashboard title based on user role
 */
export function getRoleTitle(
  role: "student" | "teacher" | "moderator" | "admin",
  t: (key: string) => string
): string {
  switch (role) {
    case "admin":
      return t("dashboard.adminPanel") || "Admin Panel";
    case "moderator":
      return t("dashboard.moderatorPanel") || "Moderator Panel";
    case "teacher":
      return t("dashboard.teacherPanel") || "Teacher Panel";
    case "student":
      return t("dashboard.studentPanel") || "Student Panel";
    default:
      return t("dashboard.dashboard") || "Dashboard";
  }
}
