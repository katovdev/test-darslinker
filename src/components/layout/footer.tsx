"use client";

import Link from "next/link";
import { MapPin, Phone } from "lucide-react";
import { config } from "@/config";
import { useLocale } from "@/hooks/use-locale";

const translations = {
  uz: {
    mainPage: "Asosiy sahifa",
    about: "Ma'lumot",
    contact: "Aloqa",
    login: "Kirish",
    address: "Toshkent shahar, Chilonzor tumani, 12-kvartal",
    rightsReserved: "Barcha huquqlar himoyalangan",
  },
  ru: {
    mainPage: "Главная страница",
    about: "Информация",
    contact: "Контакты",
    login: "Войти",
    address: "г. Ташкент, Чиланзарский район, 12-квартал",
    rightsReserved: "Все права защищены",
  },
  en: {
    mainPage: "Main page",
    about: "About",
    contact: "Contact",
    login: "Login",
    address: "Tashkent city, Chilanzar district, 12th quarter",
    rightsReserved: "All rights reserved",
  },
};

const paymentLogos = [
  { src: "/images/Group 47.png", alt: "Uzum" },
  { src: "/images/Group 39.png", alt: "Payme" },
  { src: "/images/Group 38.png", alt: "Click" },
  { src: "/images/Group 48.png", alt: "Mastercard" },
  { src: "/images/Group 36.png", alt: "Visa" },
];

export function Footer() {
  const language = useLocale();
  const t = translations[language];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold">
                dars<span className="text-primary">linker</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Online ta&apos;lim platformasi
            </p>
          </div>

          {/* Navigation */}
          <nav className="space-y-4">
            <h3 className="font-semibold">Havolalar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.mainPage}
                </Link>
              </li>
              <li>
                <Link
                  href="/#about"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.about}
                </Link>
              </li>
              <li>
                <Link
                  href="/#contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link
                  href={config.routes.login}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.login}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Aloqa</h3>
            <ul className="space-y-3 text-sm">
              <li className="text-muted-foreground flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t.address}</span>
              </li>
              <li className="text-muted-foreground flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href="tel:+998338880133"
                  className="hover:text-primary transition-colors"
                >
                  +998 33 888 01 33
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/darslinker"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                aria-label="Instagram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://t.me/darslinker"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-accent text-muted-foreground hover:bg-primary hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-full transition-colors"
                aria-label="Telegram"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-semibold">To&apos;lov usullari</h3>
            <div className="flex flex-wrap gap-3">
              {paymentLogos.map((logo) => (
                <div
                  key={logo.alt}
                  className="flex h-8 items-center rounded bg-white px-2"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-5 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="text-muted-foreground mt-8 border-t pt-8 text-center text-sm">
          <p>
            &copy; {currentYear} Darslinker. {t.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}
