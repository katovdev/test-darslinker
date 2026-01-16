"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArticlesGrid } from "@/components/blog";
import { useTranslations } from "@/hooks/use-locale";
import { ArrowRight } from "lucide-react";

export function ArticlesSection() {
  const t = useTranslations();

  return (
    <section className="bg-gray-900 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {t("home.articlesTitle")}
            </h2>
            <p className="mt-2 text-lg text-gray-400">
              {t("home.articlesSubtitle")}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="border-gray-600 bg-transparent text-white hover:bg-white/10"
          >
            <Link href="/blog">
              {t("home.viewAllArticles")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Articles Grid */}
        <div className="mt-12">
          <ArticlesGrid limit={3} />
        </div>
      </div>
    </section>
  );
}
