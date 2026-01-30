"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/use-locale";
import { Send, Instagram, Phone } from "lucide-react";

const socialLinks = [
  { icon: Send, href: "https://t.me/darslinker", label: "Telegram" },
  {
    icon: Instagram,
    href: "https://instagram.com/darslinker",
    label: "Instagram",
  },
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
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-bold text-foreground">dars</span>
              <span className="bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] bg-clip-text text-xl font-bold text-transparent">
                linker
              </span>
            </Link>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              {t("home.heroSubtitle")}
            </p>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary hover:bg-secondary/80 hover:text-foreground"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
              <a
                href="tel:+998773054755"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                +998 77-305-47-55
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((group) => (
            <div key={group.titleKey}>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                {t(`home.${group.titleKey}`) || group.titleKey}
              </h3>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground"
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
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Darslinker. {t("home.footerRights")}
          </p>
          <p className="text-sm text-muted-foreground">Made with ❤️ in Uzbekistan</p>
        </div>
      </div>
    </footer>
  );
}
