"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  ChevronDown,
  User,
  BookOpen,
  LogOut,
  Shield,
  GraduationCap,
  LayoutDashboard,
  Moon,
  Sun,
  Phone,
} from "lucide-react";
import { useTranslations, useLocale, useSetLocale } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { logout as authLogout } from "@/services/auth";
import type { Locale } from "@/i18n";

const navItems = [
  { href: "/", label: "Asosiy" },
  { href: "/#features", label: "Imkoniyatlar" },
  { href: "/#pricing", label: "Narxlar" },
  { href: "/#contact", label: "Aloqa" },
];

const languages: { value: Locale; label: string; flag: string }[] = [
  { value: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { value: "ru", label: "Русский", flag: "🇷🇺" },
  { value: "en", label: "English", flag: "🇬🇧" },
];

export function HomeHeader() {
  const t = useTranslations();
  const locale = useLocale();
  const setLocale = useSetLocale();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.value === locale);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    await authLogout();
    logout();
    router.push("/");
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  const getRoleDashboard = () => {
    if (!user) return null;

    // Everyone goes to /dashboard now
    return {
      href: "/dashboard",
      label: t("sidebar.dashboard") || "Dashboard",
      icon: LayoutDashboard,
      color: "text-[#7ea2d4] hover:bg-[#7ea2d4]/10",
    };
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-[102] bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-4 md:px-6 relative">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">dars</span>
            <span className="bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] bg-clip-text text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-transparent">
              linker
            </span>
          </Link>

          {/* Phone number - Desktop */}
          <a
            href="tel:+998901234567"
            className="hidden sm:flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            <span className="font-medium">+998 90 123 45 67</span>
          </a>
        </div>

        {/* Only show public nav items when NOT authenticated */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-6 lg:gap-8 md:flex absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors duration-100 hover:text-[#7ea2d4] whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 py-2 sm:px-3 text-sm text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-90"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
              ) : (
                <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          )}

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 sm:gap-2 rounded-lg px-2 py-2 sm:px-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <span className="text-sm sm:text-base">{currentLanguage?.flag}</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>

            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute top-full right-0 z-20 mt-2 w-40 rounded-xl border border-border bg-card p-1 shadow-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLocale(lang.value);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        locale === lang.value
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] text-sm font-medium text-white">
                      {getInitials()}
                    </div>
                    <span className="hidden text-foreground lg:inline">
                      {user.firstName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {profileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-border bg-card p-1 shadow-xl">
                        <div className="border-b border-border px-3 py-3">
                          <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/me"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <User className="h-4 w-4" />
                            {t("sidebar.profile") || "Profile"}
                          </Link>

                          {/* Student-specific: My enrolled courses */}
                          {user.role === "student" && (
                            <Link
                              href="/me/courses"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              {t("sidebar.myCourses") || "My Courses"}
                            </Link>
                          )}

                          <Link
                            href="/courses"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          >
                            <BookOpen className="h-4 w-4" />
                            {t("sidebar.browseCourses") || "Browse Courses"}
                          </Link>

                          {/* Role-specific dashboard link */}
                          {(() => {
                            const dashboard = getRoleDashboard();
                            if (!dashboard) return null;
                            const Icon = dashboard.icon;
                            return (
                              <Link
                                href={dashboard.href}
                                onClick={() => setProfileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${dashboard.color}`}
                              >
                                <Icon className="h-4 w-4" />
                                {dashboard.label}
                              </Link>
                            );
                          })()}
                        </div>

                        <div className="border-t border-border py-1">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            <LogOut className="h-4 w-4" />
                            {t("header.logout") || "Chiqish"}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden rounded-lg border border-border bg-secondary px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary/80 sm:inline-flex whitespace-nowrap"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    className="hidden rounded-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30 sm:inline-flex whitespace-nowrap"
                  >
                    {t("home.getStarted")}
                  </Link>
                </>
              )}
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden overflow-hidden"
          >
            <div className="relative h-6 w-6">
              <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                isOpen ? 'rotate-90 opacity-0 scale-0' : 'rotate-0 opacity-100 scale-100'
              }`} />
              <X className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
                isOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-0'
              }`} />
            </div>
          </button>
        </div>
      </div>
    </header>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[100] md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Overlay */}
      <div className={`fixed top-16 left-0 right-0 bg-card border-b border-border shadow-lg z-[101] md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        isOpen ? 'max-h-[60vh] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="overflow-y-auto max-h-[60vh]">
          <nav className="flex flex-col px-4 py-3 max-w-md mx-auto gap-2">
          {/* Only show public nav items when NOT authenticated */}
          {!isAuthenticated &&
            navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-100 hover:bg-secondary hover:text-[#7ea2d4] text-center"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              {/* Theme Toggle for Mobile */}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-secondary hover:text-foreground active:scale-95"
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-180" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 transition-transform duration-300 hover:-rotate-12" />
                      Dark Mode
                    </>
                  )}
                </button>
              )}

              {!isLoading && isAuthenticated && user ? (
                <>
                  <div className="mb-2 flex items-center justify-center gap-2 px-3 py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] font-semibold text-white">
                      {getInitials()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{user.phone}</p>
                    </div>
                  </div>
                  <Link
                    href="/me"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    {t("sidebar.profile") || "Profile"}
                  </Link>

                  {/* Student-specific: My enrolled courses */}
                  {user.role === "student" && (
                    <Link
                      href="/me/courses"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("sidebar.myCourses") || "My Courses"}
                    </Link>
                  )}

                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("sidebar.browseCourses") || "Browse Courses"}
                  </Link>

                  {/* Role-specific dashboard link */}
                  {(() => {
                    const dashboard = getRoleDashboard();
                    if (!dashboard) return null;
                    const Icon = dashboard.icon;
                    return (
                      <Link
                        href={dashboard.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${dashboard.color}`}
                      >
                        <Icon className="h-4 w-4" />
                        {dashboard.label}
                      </Link>
                    );
                  })()}
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("header.logout") || "Chiqish"}
                  </button>

                  {/* Phone number - Mobile (for authenticated users) */}
                  <a
                    href="tel:+998901234567"
                    className="flex sm:hidden items-center justify-center gap-2 rounded-lg bg-secondary border border-border px-4 py-3 text-base font-semibold text-foreground hover:bg-secondary/80 transition-colors mt-2"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+998 90 123 45 67</span>
                  </a>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-border bg-secondary px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-primary"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#7ea2d4]/25"
                  >
                    {t("home.getStarted")}
                  </Link>

                  {/* Phone number - Mobile */}
                  <a
                    href="tel:+998901234567"
                    className="flex sm:hidden items-center justify-center gap-2 rounded-lg bg-secondary border border-border px-4 py-3 text-base font-semibold text-foreground hover:bg-secondary/80 transition-colors mt-2"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+998 90 123 45 67</span>
                  </a>
                </>
              )}
            </div>
          </nav>
        </div>
        </div>
    </>
  );
}
