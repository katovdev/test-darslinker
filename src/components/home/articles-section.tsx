"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticlesGrid } from "@/components/blog";
import { useTranslations } from "@/hooks/use-locale";

export function ArticlesSection() {
  const t = useTranslations();

  return (
    <section
      id="blog"
      className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      style={{ scrollMarginTop: "100px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          className="rounded-[40px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20"
          style={{ backgroundColor: "#232324" }}
        >
          <div className="mx-auto">
            {/* Section header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  {t("home.articlesTitle")}
                </h2>
              </div>
              <Link
                href="/blog"
                className="group inline-flex items-center gap-2 text-white transition-colors hover:text-white/80"
              >
                {t("home.viewAllArticles")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Articles grid */}
            <div className="mt-12">
              <ArticlesGrid limit={3} darkMode />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
