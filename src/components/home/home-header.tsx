"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  BookOpen,
  Settings,
  LogOut,
  Shield,
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

  const getAdminLink = () => {
    if (user?.role === "admin") return "/_admin";
    if (user?.role === "moderator") return "/_moderator";
    return null;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold text-white">dars</span>
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
            linker
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
            >
              {t(`home.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
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
                <div className="absolute top-full right-0 z-20 mt-2 w-40 rounded-xl border border-gray-800 bg-gray-900 p-1 shadow-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLocale(lang.value);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        locale === lang.value
                          ? "bg-blue-500/10 text-blue-400"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
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
                /* Profile Dropdown */
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-white">
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
                      <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900 p-1 shadow-xl">
                        <div className="border-b border-gray-800 px-3 py-3">
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{user.phone}</p>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            {t("sidebar.dashboard") || "Dashboard"}
                          </Link>
                          <Link
                            href="/courses"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                          >
                            <BookOpen className="h-4 w-4" />
                            {t("sidebar.courses") || "Kurslar"}
                          </Link>
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                          >
                            <User className="h-4 w-4" />
                            {t("sidebar.profile") || "Profil"}
                          </Link>
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                          >
                            <Settings className="h-4 w-4" />
                            {t("sidebar.settings") || "Sozlamalar"}
                          </Link>

                          {getAdminLink() && (
                            <Link
                              href={getAdminLink()!}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-blue-400 transition-colors hover:bg-blue-500/10"
                            >
                              <Shield className="h-4 w-4" />
                              {user.role === "admin"
                                ? "Admin Panel"
                                : "Moderator Panel"}
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-800 py-1">
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
                /* Login/Register Buttons */
                <>
                  <Link
                    href="/login"
                    className="hidden rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 sm:inline-flex"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    className="hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 sm:inline-flex"
                  >
                    {t("home.getStarted")}
                  </Link>
                </>
              )}
            </>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gray-800 bg-gray-900 md:hidden">
          <nav className="flex flex-col p-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                {t(`home.${item.key}`)}
              </Link>
            ))}

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-800 pt-4">
              {!isLoading && isAuthenticated && user ? (
                /* Mobile - Logged In */
                <>
                  <div className="mb-2 flex items-center gap-3 px-4 py-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 font-medium text-white">
                      {getInitials()}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{user.phone}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {t("sidebar.dashboard") || "Dashboard"}
                  </Link>
                  <Link
                    href="/courses"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("sidebar.courses") || "Kurslar"}
                  </Link>
                  {getAdminLink() && (
                    <Link
                      href={getAdminLink()!}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
                    >
                      <Shield className="h-4 w-4" />
                      {user.role === "admin"
                        ? "Admin Panel"
                        : "Moderator Panel"}
                    </Link>
                  )}
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
                /* Mobile - Logged Out */
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:border-gray-600"
                  >
                    {t("auth.login")}
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg shadow-blue-500/25"
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
