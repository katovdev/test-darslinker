"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { RoleSidebar, type NavItem } from "@/components/ui/role-sidebar";

export function TeacherSidebar() {
  const t = useTranslations();

  const navItems: NavItem[] = [
    {
      href: "/teacher",
      label: t("teacher.dashboard") || "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/teacher/courses",
      label: t("teacher.courses") || "My Courses",
      icon: BookOpen,
    },
    {
      href: "/teacher/students",
      label: t("teacher.students") || "Students",
      icon: Users,
    },
    {
      href: "/teacher/payments",
      label: t("teacher.payments") || "Payments",
      icon: CreditCard,
    },
    {
      href: "/teacher/earnings",
      label: t("teacher.earnings") || "Earnings",
      icon: DollarSign,
    },
  ];

  return (
    <RoleSidebar
      title="Teacher"
      basePath="/teacher"
      theme="emerald"
      navItems={navItems}
    />
  );
}

export default TeacherSidebar;
