"use client";

import Link from "next/link";
import { useTranslations } from "@/hooks/use-locale";

export function HomeFooter() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800 bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-1">
              <span className="text-2xl font-bold text-white">dars</span>
              <span className="text-2xl font-bold text-[#7EA2D4]">linker</span>
            </Link>
            <p className="mt-4 max-w-md text-gray-400">
              {t("home.heroSubtitle")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              {t("home.navHome")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t("home.navHome")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t("home.navBlog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t("home.navPricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-white">
              {t("sidebar.support")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t("home.footerPrivacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  {t("home.footerTerms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500">
            &copy; {currentYear} Darslinker. {t("home.footerRights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
