"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations, useLocale, useSetLocale } from "@/hooks/use-locale";
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
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.value === locale);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1">
          <span className="text-2xl font-bold text-white">dars</span>
          <span className="text-2xl font-bold text-[#7EA2D4]">linker</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {t(`home.${item.key}`)}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <Select value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            <SelectTrigger className="w-auto gap-2 border-gray-700 bg-transparent text-white">
              <span>{currentLanguage?.flag}</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-800">
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Login Button */}
          <Button
            asChild
            className="hidden bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90 sm:inline-flex"
          >
            <Link href="/login">{t("auth.login")}</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 border-gray-800 bg-gray-900"
            >
              <div className="flex flex-col gap-6 pt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-gray-300 transition-colors hover:text-white"
                  >
                    {t(`home.${item.key}`)}
                  </Link>
                ))}
                <Button
                  asChild
                  className="mt-4 bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
                >
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    {t("auth.login")}
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
