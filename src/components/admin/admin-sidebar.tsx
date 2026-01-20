"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  DollarSign,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function AdminSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      href: "/_admin",
      label: t("admin.dashboard") || "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/_admin/users",
      label: t("admin.users") || "Users",
      icon: Users,
    },
    {
      href: "/_admin/courses",
      label: t("admin.courses") || "Courses",
      icon: BookOpen,
    },
    {
      href: "/_admin/payments",
      label: t("admin.payments") || "Payments",
      icon: CreditCard,
    },
    {
      href: "/_admin/earnings",
      label: t("admin.earnings") || "Earnings",
      icon: DollarSign,
    },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const isActive = (href: string) => {
    if (href === "/_admin") {
      return pathname === "/_admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-gray-800 p-2 text-white lg:hidden"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 transform border-r border-gray-800 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="text-sm font-bold text-white">A</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-white">Admin</span>
              <span className="text-sm text-gray-500"> Panel</span>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-blue-500/10 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-blue-400" : ""}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

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

export default AdminSidebar;
