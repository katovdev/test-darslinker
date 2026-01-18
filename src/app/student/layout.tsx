"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Bell,
  User,
  LogOut,
  Menu,
  CreditCard,
  Loader2,
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
  useTenant,
  useIsTeacherSubdomain,
} from "@/store";
import { useTranslations } from "@/hooks/use-locale";
import { publicAPI } from "@/lib/api";
import {
  isTeacherSubdomain as checkTeacherSubdomain,
} from "@/lib/tenant";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/student/dashboard", icon: Home, labelKey: "dashboard" },
  { href: "/student/courses", icon: BookOpen, labelKey: "myCourses" },
  { href: "/student/payments", icon: CreditCard, labelKey: "payments" },
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
  const tenant = useTenant();
  const isOnTeacherSubdomain = useIsTeacherSubdomain();
  const logout = useAppStore((state) => state.logout);
  const setTenant = useAppStore((state) => state.setTenant);
  const setIsTeacherSubdomain = useAppStore(
    (state) => state.setIsTeacherSubdomain
  );
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      const isTeacher = checkTeacherSubdomain();
      setIsTeacherSubdomain(isTeacher);

      if (isTeacher) {
        try {
          const response = await publicAPI.getTenant();
          if (response.success && response.data) {
            setTenant(response.data);
          }
        } catch (error) {
          console.error("Failed to load tenant:", error);
        }
      }
      setIsLoadingTenant(false);
    };

    loadTenant();
  }, [setTenant, setIsTeacherSubdomain]);

  useEffect(() => {
    if (!isAuthenticated && !isLoadingTenant) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoadingTenant, router]);

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

  if (!isAuthenticated || isLoadingTenant) {
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

  const logoUrl = tenant?.logoUrl;
  const businessName = tenant?.businessName || "Darslinker";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-4 sm:px-6">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-border bg-sidebar p-0"
              >
                <SheetHeader className="border-b px-4 py-3">
                  <SheetTitle className="text-left text-base font-semibold">
                    {isOnTeacherSubdomain ? businessName : "Darslinker"}
                  </SheetTitle>
                </SheetHeader>
                <nav className="p-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {t(`sidebar.${item.labelKey}`)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              href="/student/dashboard"
              className="flex items-center gap-1 text-base font-semibold"
            >
              {logoUrl ? (
                <img src={logoUrl} alt={businessName} className="h-6 w-auto" />
              ) : (
                <>
                  <span>{isOnTeacherSubdomain ? businessName : "dars"}</span>
                  {!isOnTeacherSubdomain && <span className="text-link">linker</span>}
                </>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
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
                className="flex items-center gap-2 px-2"
              >
                <Avatar className="h-7 w-7">
                  {user?.avatar && <AvatarImage src={user.avatar} />}
                  <AvatarFallback className="bg-secondary text-xs font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">
                  {user?.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href="/student/profile"
                  className="flex cursor-pointer items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t("sidebar.profile")}
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
      <main className="mx-auto max-w-[900px] px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
