"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ArticlesGrid } from "@/components/blog";
import { useTranslations } from "@/hooks/use-locale";

export function ArticlesSection() {
  const t = useTranslations();

  return (
    <section id="blog" className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-secondary/30" />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-500">
              {t("home.articlesLabel") || "Blog"}
            </span>
            <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
              {t("home.articlesTitle")}
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
          >
            {t("home.viewAllArticles")}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Articles grid */}
        <div className="mt-12">
          <ArticlesGrid limit={3} />
        </div>
      </div>
    </section>
  );
}
