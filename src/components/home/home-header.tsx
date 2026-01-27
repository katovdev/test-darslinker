"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { useTranslations, useLocale, useSetLocale } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { logout as authLogout } from "@/services/auth";
import type { Locale } from "@/i18n";

const navItems = [
  { href: "/", key: "navHome" },
  { href: "/blog", key: "navBlog" },
  { href: "/pricing", key: "navPricing" },
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

  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.value === locale);

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
    <header className="sticky top-0 z-50 border-b border-[#3a3a3b] bg-[#232324]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-white">dars</span>
          <span className="bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] bg-clip-text text-xl font-bold text-transparent">
            linker
          </span>
        </Link>

        {/* Only show public nav items when NOT authenticated */}
        {!isAuthenticated && (
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-[#a0a5a8] transition-colors hover:text-white"
              >
                {t(`home.${item.key}`)}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
            >
              <span className="text-base">{currentLanguage?.flag}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute top-full right-0 z-20 mt-2 w-40 rounded-xl border border-[#3a3a3b] bg-[#232324] p-1 shadow-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLocale(lang.value);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        locale === lang.value
                          ? "bg-[#7ea2d4]/10 text-[#7ea2d4]"
                          : "text-[#a0a5a8] hover:bg-[#2e2e2f] hover:text-white"
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
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] text-sm font-medium text-white">
                      {getInitials()}
                    </div>
                    <span className="hidden text-white lg:inline">
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
                      <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-[#3a3a3b] bg-[#232324] p-1 shadow-xl">
                        <div className="border-b border-[#3a3a3b] px-3 py-3">
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-[#a0a5a8]">{user.phone}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/me"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                          >
                            <User className="h-4 w-4" />
                            {t("sidebar.profile") || "Profile"}
                          </Link>

                          {/* Student-specific: My enrolled courses */}
                          {user.role === "student" && (
                            <Link
                              href="/me/courses"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              {t("sidebar.myCourses") || "My Courses"}
                            </Link>
                          )}

                          <Link
                            href="/courses"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
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

                        <div className="border-t border-[#3a3a3b] py-1">
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
                    className="hidden rounded-lg border border-[#3a3a3b] bg-[#2e2e2f] px-4 py-2 text-sm font-medium text-white transition-colors hover:border-[#4a4a4b] hover:bg-[#3a3a3b] sm:inline-flex"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    className="hidden rounded-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30 sm:inline-flex"
                  >
                    {t("home.getStarted")}
                  </Link>
                </>
              )}
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-[#3a3a3b] bg-[#232324] md:hidden">
          <nav className="flex flex-col p-4">
            {/* Only show public nav items when NOT authenticated */}
            {!isAuthenticated &&
              navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                >
                  {t(`home.${item.key}`)}
                </Link>
              ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-[#3a3a3b] pt-4">
              {!isLoading && isAuthenticated && user ? (
                <>
                  <div className="mb-2 flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] font-medium text-white">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-[#a0a5a8]">{user.phone}</p>
                    </div>
                  </div>
                  <Link
                    href="/me"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    {t("sidebar.profile") || "Profile"}
                  </Link>

                  {/* Student-specific: My enrolled courses */}
                  {user.role === "student" && (
                    <Link
                      href="/me/courses"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t("sidebar.myCourses") || "My Courses"}
                    </Link>
                  )}

                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[#a0a5a8] transition-colors hover:bg-[#2e2e2f] hover:text-white"
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
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${dashboard.color}`}
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
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("header.logout") || "Chiqish"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-[#3a3a3b] bg-[#2e2e2f] px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:border-[#4a4a4b]"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-[#7ea2d4]/25"
                  >
                    {t("home.getStarted")}
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
