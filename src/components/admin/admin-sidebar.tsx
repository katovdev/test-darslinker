"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { RoleSidebar, type NavItem } from "@/components/ui/role-sidebar";

export function AdminSidebar() {
  const t = useTranslations();

  const navItems: NavItem[] = [
    {
      href: "/admin",
      label: t("admin.dashboard") || "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/users",
      label: t("admin.users") || "Users",
      icon: Users,
    },
    {
      href: "/admin/courses",
      label: t("admin.courses") || "Courses",
      icon: BookOpen,
    },
    {
      href: "/admin/payments",
      label: t("admin.payments") || "Payments",
      icon: CreditCard,
    },
    {
      href: "/admin/earnings",
      label: t("admin.earnings") || "Earnings",
      icon: DollarSign,
    },
    {
      href: "/admin/blogs",
      label: t("admin.blogs") || "Blogs",
      icon: FileText,
    },
    {
      href: "/admin/settings",
      label: t("admin.settings") || "Settings",
      icon: Settings,
    },
  ];

  return (
    <RoleSidebar
      title="Admin"
      basePath="/admin"
      theme="blue"
      navItems={navItems}
    />
  );
}

export default AdminSidebar;
