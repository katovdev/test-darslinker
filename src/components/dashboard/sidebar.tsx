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
  BarChart3,
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
    <aside className="fixed top-0 left-0 z-40 h-screen w-60 border-r bg-sidebar pt-14">
      <div className="flex h-full flex-col overflow-y-auto px-2 py-4">
        <nav className="flex-1 space-y-0.5">
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
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                        isExpanded
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
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
                      <div className="mt-0.5 space-y-0.5 pl-10">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block rounded-md px-3 py-1.5 text-sm transition-colors",
                              isActive(child.href)
                                ? "bg-accent font-medium text-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
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
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      itemIsActive
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
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
