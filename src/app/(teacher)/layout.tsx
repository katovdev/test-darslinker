"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  Loader2,
  BarChart3,
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
import {
  useIsAuthenticated,
  useUser,
  useAppStore,
  useHasHydrated,
} from "@/store";
import { useTranslations } from "@/hooks/use-locale";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/teacher/dashboard", icon: Home, labelKey: "dashboard" },
  { href: "/teacher/courses", icon: BookOpen, labelKey: "courses" },
  { href: "/teacher/students", icon: Users, labelKey: "students" },
  { href: "/teacher/payments", icon: CreditCard, labelKey: "payments" },
  { href: "/teacher/stats", icon: BarChart3, labelKey: "analytics" },
  { href: "/teacher/settings", icon: Settings, labelKey: "settings" },
];

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useHasHydrated();
  const user = useUser();
  const logout = useAppStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only check after hydration is complete
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "teacher" && user.role !== "admin") {
      router.push("/student/dashboard");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, hasHydrated, user, router]);

  const handleLogout = async () => {
    try {
      // Call logout API to clear httpOnly cookies
      const { logout: logoutApi } = await import("@/services/auth");
      await logoutApi();
    } catch {
      // Ignore errors, clear local state anyway
      logout();
    }
    router.push("/login");
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  if (!hasHydrated || isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Sidebar - Desktop */}
      <aside className="bg-sidebar fixed inset-y-0 left-0 z-50 hidden w-60 border-r lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-1 text-base font-semibold"
            >
              <span>dars</span>
              <span className="text-link">linker</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 p-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(`teacher.${item.labelKey}`)}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {user?.avatar && <AvatarImage src={user.avatar} />}
                <AvatarFallback className="bg-secondary text-sm font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {user?.username ? `@${user.username}` : t("teacher.teacher")}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive mt-3 w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              {t("dashboard.logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="bg-background sticky top-0 z-40 border-b lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="border-border bg-sidebar w-64 p-0"
            >
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-1 text-left text-base font-semibold">
                  <span>dars</span>
                  <span className="text-link">linker</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="space-y-0.5 p-2">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {t(`teacher.${item.labelKey}`)}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            href="/teacher/dashboard"
            className="flex items-center gap-1 text-base font-semibold"
          >
            <span>dars</span>
            <span className="text-link">linker</span>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <Avatar className="h-7 w-7">
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-secondary text-xs font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href="/teacher/settings"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  {t("teacher.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive flex cursor-pointer items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("dashboard.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-60">
        <div className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
