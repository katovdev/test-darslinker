"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  UserPlus,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  Loader2,
  BarChart3,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsAuthenticated, useUser, useAppStore } from "@/store";
import { useTranslations } from "@/hooks/use-locale";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: Home, labelKey: "dashboard" },
  { href: "/admin/requests", icon: UserPlus, labelKey: "requests" },
  { href: "/admin/teachers", icon: GraduationCap, labelKey: "teachers" },
  { href: "/admin/users", icon: Users, labelKey: "users" },
  { href: "/admin/stats", icon: BarChart3, labelKey: "analytics" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const logout = useAppStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
      // Not an admin, redirect based on role
      if (user.role === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  // Loading state
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#7EA2D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-gray-800 bg-gray-900 lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-800 px-6">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-xl font-bold text-[#7EA2D4]"
            >
              <Shield className="h-6 w-6" />
              Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#7EA2D4]/10 text-[#7EA2D4]"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {t(`admin.${item.labelKey}`)}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-gray-400">
                  {t("admin.admin")}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="mt-3 w-full justify-start gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              {t("dashboard.logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-900/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-gray-800 bg-gray-900 p-0"
            >
              <SheetHeader className="border-b border-gray-800 px-6 py-4">
                <SheetTitle className="flex items-center gap-2 text-left text-xl font-bold text-[#7EA2D4]">
                  <Shield className="h-6 w-6" />
                  Admin
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-1 p-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[#7EA2D4]/10 text-[#7EA2D4]"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {t(`admin.${item.labelKey}`)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-xl font-bold text-[#7EA2D4]"
          >
            <Shield className="h-5 w-5" />
            Admin
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-gray-800 bg-gray-900"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/admin/stats"
                  className="flex cursor-pointer items-center gap-2 text-gray-300"
                >
                  <BarChart3 className="h-4 w-4" />
                  {t("admin.analytics")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 text-red-400 focus:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                {t("dashboard.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
