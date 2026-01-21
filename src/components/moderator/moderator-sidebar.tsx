"use client";

import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  MessageSquare,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import {
  RoleSidebar,
  SidebarInfoBanner,
  type NavItem,
} from "@/components/ui/role-sidebar";

export function ModeratorSidebar() {
  const t = useTranslations();

  const navItems: NavItem[] = [
    {
      href: "/moderator",
      label: t("moderator.dashboard") || "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/moderator/users",
      label: t("moderator.users") || "Users",
      icon: Users,
    },
    {
      href: "/moderator/teachers",
      label: t("moderator.teachers") || "Teachers",
      icon: GraduationCap,
    },
    {
      href: "/moderator/courses",
      label: t("moderator.courses") || "Courses",
      icon: BookOpen,
    },
    {
      href: "/moderator/blogs",
      label: t("moderator.blogs") || "Blogs",
      icon: FileText,
    },
    {
      href: "/moderator/advice",
      label: t("moderator.advice") || "Advice Requests",
      icon: MessageSquare,
    },
    {
      href: "/moderator/settings",
      label: t("moderator.settings") || "Settings",
      icon: Settings,
    },
  ];

  return (
    <RoleSidebar
      title="Moderator"
      basePath="/moderator"
      theme="green"
      navItems={navItems}
      infoBanner={
        <SidebarInfoBanner variant="warning">
          {t("moderator.limitedAccess") ||
            "Limited access. Financial data is restricted."}
        </SidebarInfoBanner>
      }
    />
  );
}

export default ModeratorSidebar;
