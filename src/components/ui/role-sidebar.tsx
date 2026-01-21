"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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

export type SidebarTheme = "blue" | "green" | "emerald" | "purple" | "orange" | "teal";

export interface RoleSidebarProps {
  /** Navigation items */
  navItems: NavItem[];
  /** Panel title (e.g., "Admin", "Teacher") */
  title: string;
  /** Optional subtitle (default: "Panel") */
  subtitle?: string;
  /** Logo character or short text */
  logoText?: string;
  /** Color theme for the sidebar */
  theme?: SidebarTheme;
  /** Base path for active link detection */
  basePath: string;
  /** Optional info banner to show above logout */
  infoBanner?: React.ReactNode;
  /** Additional className for the sidebar */
  className?: string;
  /** Custom logout handler (default uses auth context) */
  onLogout?: () => void;
}

const themeClasses: Record<SidebarTheme, {
  gradient: string;
  active: string;
  activeText: string;
}> = {
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
 * A reusable sidebar component for role-based dashboards (admin, teacher, moderator)
 *
 * @example
 * <RoleSidebar
 *   title="Admin"
 *   basePath="/admin"
 *   theme="blue"
 *   navItems={[
 *     { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
 *     { href: "/admin/users", label: "Users", icon: Users },
 *   ]}
 * />
 */
export function RoleSidebar({
  navItems,
  title,
  subtitle = "Panel",
  logoText,
  theme = "blue",
  basePath,
  infoBanner,
  className,
  onLogout,
}: RoleSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
          "fixed top-0 left-0 z-40 h-screen w-64 transform border-r border-gray-800 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br",
                themeConfig.gradient
              )}
            >
              <span className="text-sm font-bold text-white">
                {logoText || title.charAt(0)}
              </span>
            </div>
            <div>
              <span className="text-lg font-semibold text-white">{title}</span>
              <span className="text-sm text-gray-500"> {subtitle}</span>
            </div>
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
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5", active && themeConfig.activeText)}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      themeConfig.active
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Info banner (optional) */}
          {infoBanner && (
            <div className="border-t border-gray-800 px-3 py-3">
              {infoBanner}
            </div>
          )}

          {/* Logout button */}
          <div className="border-t border-gray-800 p-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              {t("common.logout") || "Logout"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * Info banner component for showing warnings/notices in sidebar
 */
export interface SidebarInfoBannerProps {
  children: React.ReactNode;
  variant?: "warning" | "info" | "success";
  className?: string;
}

const bannerVariants = {
  warning: "bg-yellow-500/10 text-yellow-400",
  info: "bg-blue-500/10 text-blue-400",
  success: "bg-green-500/10 text-green-400",
};

export function SidebarInfoBanner({
  children,
  variant = "info",
  className,
}: SidebarInfoBannerProps) {
  return (
    <div className={cn("rounded-lg p-3", bannerVariants[variant], className)}>
      <p className="text-xs">{children}</p>
    </div>
  );
}

export default RoleSidebar;
