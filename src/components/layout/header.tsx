"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { config } from "@/config";

type Language = "uz" | "ru" | "en";

interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { code: "uz", label: "UZ", flag: "/images/uz-flag.jpg" },
  { code: "ru", label: "RU", flag: "/images/ru-flag.jpg" },
  { code: "en", label: "EN", flag: "/images/us-flag.png" },
];

const translations = {
  uz: {
    home: "Asosiy",
    about: "Ma'lumot",
    blog: "Bloglar",
    contact: "Aloqa",
    login: "Kirish",
  },
  ru: {
    home: "Главная",
    about: "Информация",
    blog: "Блоги",
    contact: "Контакты",
    login: "Войти",
  },
  en: {
    home: "Home",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    login: "Login",
  },
};

interface NavItem {
  key: keyof typeof translations.uz;
  href: string;
}

const navItems: NavItem[] = [
  { key: "home", href: "/" },
  { key: "about", href: "/#about" },
  { key: "blog", href: "/blog" },
  { key: "contact", href: "/#contact" },
];

export function Header() {
  const [language, setLanguage] = useState<Language>("uz");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const t = translations[language];
  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  // Close language dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load saved language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang && languages.some((l) => l.code === savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    setIsLangOpen(false);
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            dars<span className="text-primary">linker</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "hover:text-primary text-sm font-medium transition-colors",
                isActiveLink(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {t[item.key]}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="hover:bg-accent flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              <img
                src={currentLang.flag}
                alt={currentLang.label}
                className="h-4 w-6 rounded object-cover"
              />
              <span>{currentLang.label}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isLangOpen && "rotate-180"
                )}
              />
            </button>

            {isLangOpen && (
              <div className="bg-popover absolute top-full right-0 mt-1 w-28 rounded-md border p-1 shadow-md">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={cn(
                      "hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                      language === lang.code && "bg-accent"
                    )}
                  >
                    <img
                      src={lang.flag}
                      alt={lang.label}
                      className="h-4 w-6 rounded object-cover"
                    />
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Login Button */}
          <Button asChild>
            <Link href={config.routes.login}>{t.login}</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 pt-8">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "hover:text-primary text-lg font-medium transition-colors",
                    isActiveLink(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {t[item.key]}
                </Link>
              ))}

              {/* Mobile Language Selector */}
              <div className="mt-4 border-t pt-4">
                <p className="text-muted-foreground mb-2 text-sm">
                  Til / Language
                </p>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        language === lang.code
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      <img
                        src={lang.flag}
                        alt={lang.label}
                        className="h-4 w-6 rounded object-cover"
                      />
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Login Button */}
              <Button asChild className="mt-4">
                <Link
                  href={config.routes.login}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {t.login}
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
