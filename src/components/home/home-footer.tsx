"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/use-locale";
import { Send, Instagram, Youtube } from "lucide-react";

const socialLinks = [
  { icon: Send, href: "https://t.me/darslinker", label: "Telegram" },
  {
    icon: Instagram,
    href: "https://instagram.com/darslinker",
    label: "Instagram",
  },
  { icon: Youtube, href: "https://youtube.com/darslinker", label: "YouTube" },
];

const footerLinks = [
  {
    titleKey: "footerPlatform",
    links: [
      { href: "/", key: "navHome" },
      { href: "/blog", key: "navBlog" },
      { href: "/pricing", key: "navPricing" },
    ],
  },
  {
    titleKey: "footerLegal",
    links: [
      { href: "/privacy", key: "footerPrivacy" },
      { href: "/terms", key: "footerTerms" },
    ],
  },
];

export function HomeFooter() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-xl font-bold text-white">dars</span>
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
                linker
              </span>
            </Link>
            <p className="mt-4 max-w-md leading-relaxed text-gray-400">
              {t("home.heroSubtitle")}
            </p>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 bg-gray-800/50 text-gray-400 transition-colors hover:border-gray-700 hover:bg-gray-800 hover:text-white"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.titleKey}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-400 uppercase">
                {t(`home.${group.titleKey}`) || group.titleKey}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-gray-500 transition-colors hover:text-white"
                    >
                      {t(`home.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Darslinker. {t("home.footerRights")}
          </p>
          <p className="text-sm text-gray-600">Made with ❤️ in Uzbekistan</p>
        </div>
      </div>
    </footer>
  );
}
