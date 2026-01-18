"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  UserPlus,
  GraduationCap,
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user && user.role !== "admin") {
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

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r bg-sidebar lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-base font-semibold"
            >
              <Shield className="h-5 w-5 text-muted-foreground" />
              Admin
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
                      ? "bg-accent font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {t(`admin.${item.labelKey}`)}
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
                <p className="truncate text-xs text-muted-foreground">
                  {t("admin.admin")}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="mt-3 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t("dashboard.logout")}
            </Button>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
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
              className="w-64 border-border bg-sidebar p-0"
            >
              <SheetHeader className="border-b px-4 py-3">
                <SheetTitle className="flex items-center gap-2 text-left text-base font-semibold">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  Admin
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
                          ? "bg-accent font-medium text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
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
            className="flex items-center gap-2 text-base font-semibold"
          >
            <Shield className="h-5 w-5 text-muted-foreground" />
            Admin
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
                  href="/admin/stats"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  {t("admin.analytics")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
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
