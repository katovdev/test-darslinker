"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-locale";
import { Play, Sparkles, CreditCard, BarChart3 } from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    titleKey: "featureAI",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: CreditCard,
    titleKey: "featurePayments",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    titleKey: "featureAnalytics",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function Hero() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 px-4 py-20 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-1/4 h-96 w-96 rounded-full bg-[#7EA2D4]/10 blur-3xl" />
        <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {/* Logo */}
          <Link href="/" className="mb-8 inline-flex items-center gap-1">
            <span className="text-4xl font-bold text-white">dars</span>
            <span className="text-4xl font-bold text-[#7EA2D4]">linker</span>
          </Link>

          {/* Hero Title */}
          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t("home.heroTitle")}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300">
            {t("home.heroSubtitle")}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] px-8 text-lg text-white hover:opacity-90"
            >
              <Link href="/register">{t("home.getStarted")}</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-gray-600 bg-transparent px-8 text-lg text-white hover:bg-white/10"
            >
              <Play className="mr-2 h-5 w-5" />
              {t("home.watchVideo")}
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.titleKey}
              className="group relative overflow-hidden rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 backdrop-blur-sm transition-all hover:border-gray-600 hover:bg-gray-800/70"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-r ${card.gradient} p-3`}
              >
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                {t(`home.${card.titleKey}`)}
              </h3>
              <p className="mt-2 text-gray-400">
                {t(`home.${card.titleKey}Desc`)}
              </p>
              {/* Hover glow effect */}
              <div
                className={`pointer-events-none absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-gradient-to-r ${card.gradient} opacity-0 blur-3xl transition-opacity group-hover:opacity-20`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
