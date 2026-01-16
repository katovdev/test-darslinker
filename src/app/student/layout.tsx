"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, BookOpen, Bell, User, LogOut, Menu } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsAuthenticated, useUser, useAppStore } from "@/store";
import { useTranslations } from "@/hooks/use-locale";

const navItems = [
  { href: "/student/dashboard", icon: Home, labelKey: "dashboard" },
  { href: "/student/courses", icon: BookOpen, labelKey: "myCourses" },
  { href: "/student/notifications", icon: Bell, labelKey: "notifications" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const logout = useAppStore((state) => state.logout);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-[#7EA2D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-gray-800 bg-gray-900"
              >
                <SheetHeader>
                  <SheetTitle className="text-white">Darslinker</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                    >
                      <item.icon className="h-5 w-5" />
                      {t(`sidebar.${item.labelKey}`)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              href="/student/dashboard"
              className="text-xl font-bold text-white"
            >
              Darslinker
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <item.icon className="h-4 w-4" />
                {t(`sidebar.${item.labelKey}`)}
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-400 hover:text-white"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                  <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-gray-800 bg-gray-900"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/student/profile"
                  className="flex cursor-pointer items-center gap-2 text-gray-300"
                >
                  <User className="h-4 w-4" />
                  {t("sidebar.profile")}
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
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
