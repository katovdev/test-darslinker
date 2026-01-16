"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  BookOpen,
  MessageSquare,
  Settings,
  ChevronDown,
  Globe,
  BarChart3,
  Users,
  FileText,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-locale";

interface MenuItem {
  icon: React.ElementType;
  labelKey: string;
  href?: string;
  children?: { labelKey: string; href: string }[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    labelKey: "dashboard",
    href: "/dashboard",
  },
  {
    icon: User,
    labelKey: "profile",
    href: "/dashboard/profile",
  },
  {
    icon: BookOpen,
    labelKey: "myCourses",
    href: "/dashboard/courses",
  },
  {
    icon: MessageSquare,
    labelKey: "messages",
    href: "/dashboard/messages",
  },
  {
    icon: BarChart3,
    labelKey: "general",
    children: [
      { labelKey: "dashboard", href: "/dashboard/analytics" },
      { labelKey: "profile", href: "/dashboard/analytics/students" },
    ],
  },
  {
    icon: Settings,
    labelKey: "settings",
    children: [
      { labelKey: "language", href: "/dashboard/settings/language" },
      { labelKey: "editProfile", href: "/dashboard/settings/profile" },
    ],
  },
];

export function DashboardSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (labelKey: string) => {
    setExpandedItems((prev) =>
      prev.includes(labelKey)
        ? prev.filter((k) => k !== labelKey)
        : [...prev, labelKey]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-gray-900 pt-16">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-6">
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.labelKey);
            const itemIsActive = item.href ? isActive(item.href) : false;

            return (
              <div key={item.labelKey}>
                {hasChildren ? (
                  <>
                    <button
                      onClick={() => toggleExpanded(item.labelKey)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                        isExpanded
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {t(`sidebar.${item.labelKey}`)}
                      </span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded && "rotate-180"
                        )}
                      />
                    </button>
                    {isExpanded && item.children && (
                      <div className="mt-1 space-y-1 pl-12">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-lg px-4 py-2 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-[#7EA2D4]/10 text-[#7EA2D4]"
                                : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                            )}
                          >
                            {t(`sidebar.${child.labelKey}`)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                      itemIsActive
                        ? "bg-[#7EA2D4]/10 text-[#7EA2D4]"
                        : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(`sidebar.${item.labelKey}`)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
