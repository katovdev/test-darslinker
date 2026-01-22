"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";

export interface NavItem {
  /** Route path */
  href: string;
  /** Display label */
  label: string;
  /** Lucide icon component */
  icon: React.ComponentType<{ className?: string }>;
  /** Optional badge content (e.g., notification count) */
  badge?: string | number;
}

export type SidebarTheme =
  | "blue"
  | "green"
  | "emerald"
  | "purple"
  | "orange"
  | "teal";

export interface CollapsibleSidebarProps {
  /** Navigation items */
  navItems: NavItem[];
  /** Panel title (e.g., "Dashboard") */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Logo character or short text */
  logoText?: string;
  /** Color theme for the sidebar */
  theme?: SidebarTheme;
  /** Base path for active link detection */
  basePath: string;
  /** Additional className for the sidebar */
  className?: string;
  /** Custom logout handler (default uses auth context) */
  onLogout?: () => void;
}

const themeClasses: Record<
  SidebarTheme,
  {
    gradient: string;
    active: string;
    activeText: string;
  }
> = {
  blue: {
    gradient: "from-blue-500 to-purple-600",
    active: "bg-blue-500/10 text-blue-400",
    activeText: "text-blue-400",
  },
  green: {
    gradient: "from-green-500 to-teal-600",
    active: "bg-green-500/10 text-green-400",
    activeText: "text-green-400",
  },
  emerald: {
    gradient: "from-emerald-500 to-teal-600",
    active: "bg-emerald-500/10 text-emerald-400",
    activeText: "text-emerald-400",
  },
  purple: {
    gradient: "from-purple-500 to-pink-600",
    active: "bg-purple-500/10 text-purple-400",
    activeText: "text-purple-400",
  },
  orange: {
    gradient: "from-orange-500 to-red-600",
    active: "bg-orange-500/10 text-orange-400",
    activeText: "text-orange-400",
  },
  teal: {
    gradient: "from-teal-500 to-cyan-600",
    active: "bg-teal-500/10 text-teal-400",
    activeText: "text-teal-400",
  },
};

/**
 * A collapsible sidebar component for the unified dashboard
 */
export function CollapsibleSidebar({
  navItems,
  title,
  subtitle,
  logoText,
  theme = "blue",
  basePath,
  className,
  onLogout,
}: CollapsibleSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout: authLogout } = useAuth();

  const themeConfig = themeClasses[theme];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      authLogout();
      window.location.href = "/login";
    }
  };

  const isActive = (href: string) => {
    if (href === basePath) {
      return pathname === basePath;
    }
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      {/* Mobile menu toggle button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-gray-800 p-2 text-white lg:hidden"
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transform border-r border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          "w-64", // Mobile always full width
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-800 px-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <div
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br",
                  themeConfig.gradient
                )}
              >
                <span className="text-sm font-bold text-white">
                  {logoText || title.charAt(0)}
                </span>
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-semibold text-white">
                    {title}
                  </div>
                  {subtitle && (
                    <div className="truncate text-sm text-gray-500">
                      {subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop collapse button */}
            <button
              onClick={toggleCollapse}
              className="hidden rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white lg:block"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? themeConfig.active
                      : "text-gray-400 hover:bg-gray-800 hover:text-white",
                    isCollapsed && "justify-center lg:px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      active && themeConfig.activeText
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge !== undefined && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            themeConfig.active
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge !== undefined && (
                    <span
                      className={cn(
                        "absolute top-1 right-1 h-2 w-2 rounded-full",
                        themeConfig.active
                      )}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-gray-800 p-3">
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white",
                isCollapsed && "justify-center lg:px-2"
              )}
              title={isCollapsed ? t("common.logout") || "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{t("common.logout") || "Logout"}</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default CollapsibleSidebar;
