"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles, X } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

interface PlanFeature {
  key: string;
  label: string;
  included: boolean | string;
}

interface Plan {
  nameKey: string;
  price: string;
  recommended?: boolean;
  includesAllFrom?: string;
  displayFeatures: PlanFeature[];
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "free",
    displayFeatures: [
      { key: "courses", label: "Kurslar", included: "1" },
      { key: "admins", label: "Adminlar", included: "1" },
      { key: "students", label: "O'quvchilar", included: "20/oy" },
      { key: "contentSecurity", label: "Kontent xavfsizligi", included: true },
      { key: "support", label: "Qo'llab-quvvatlash", included: true },
      { key: "studentAnalytics", label: "O'quvchilar tahlili", included: true },
      { key: "telegramBot", label: "Telegram bot", included: true },
    ],
  },
  {
    nameKey: "planStandard",
    price: "670,000",
    recommended: true,
    includesAllFrom: "planMinimal",
    displayFeatures: [
      { key: "courses", label: "Kurslar", included: "3" },
      { key: "admins", label: "Adminlar", included: "3" },
      { key: "students", label: "O'quvchilar", included: "cheksiz" },
      { key: "includesAll", label: "Minimaldagi imkoniyatlar", included: true },
      { key: "onlineMeetings", label: "Onlayn uchrashuvlar", included: true },
      { key: "certificates", label: "Sertifikatlar", included: true },
      { key: "paymentIntegration", label: "To'lov integratsiyasi", included: true },
    ],
  },
  {
    nameKey: "planPro",
    price: "1,270,000",
    includesAllFrom: "planStandard",
    displayFeatures: [
      { key: "courses", label: "Kurslar", included: "6" },
      { key: "admins", label: "Adminlar", included: "6" },
      { key: "students", label: "O'quvchilar", included: "cheksiz" },
      { key: "includesAll", label: "Standartdagi imkoniyatlar", included: true },
      { key: "customBranding", label: "Shaxsiy brending", included: true },
      { key: "seo", label: "SEO", included: true },
    ],
  },
];

export function PricingSection() {
  const t = useTranslations();

  const renderFeatureValue = (feature: PlanFeature) => {
    if (feature.included === "unlimited") {
      return (
        <span className="text-sm font-medium text-green-500">
          {t("pricing.unlimited")}
        </span>
      );
    }
    if (typeof feature.included === "string") {
      return (
        <span className="text-sm font-semibold text-white">
          {feature.included}
        </span>
      );
    }
    if (feature.included === true) {
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-3 w-3 text-green-500" />
        </div>
      );
    }
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
        <X className="h-3 w-3 text-white/50" />
      </div>
    );
  };

  return (
    <section
      id="pricing"
      className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-20"
      style={{ scrollMarginTop: "40px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          className="rounded-[40px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20"
          style={{ backgroundColor: "#232324" }}
        >
          <div className="mx-auto">
            {/* Section header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t("pricing.subtitle")}
              </h2>
            </div>

            {/* Pricing Cards */}
            <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.recommended
                  ? "border-white/20 shadow-lg"
                  : "border-white/10 hover:border-white/20"
              }`}
              style={{
                backgroundColor: plan.recommended
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.025)"
              }}
            >
              {/* Recommended Badge */}
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-[#7ea2d4]/25">
                    <Sparkles className="h-3 w-3" />
                    {t("pricing.recommended")}
                  </div>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-4xl font-bold text-white mb-6">
                {t(`pricing.${plan.nameKey}`)}
              </h3>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-3">
                {/* Show features */}
                {plan.displayFeatures.map((feature) => (
                  <li
                    key={feature.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-white/70">
                      {feature.label}
                    </span>
                    {renderFeatureValue(feature)}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mb-4 mt-auto">
                {plan.price === "free" ? (
                  <span className="text-4xl font-bold text-white">
                    Bepul
                  </span>
                ) : plan.price === "custom" ? (
                  <span className="text-4xl font-bold text-white">
                    {t("pricing.contactUs")}
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-white/60">
                      so&apos;m/{t("pricing.perMonth")}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button - Goes to full pricing page */}
              <Link
                href="/pricing"
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.recommended
                    ? "bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] text-white shadow-lg shadow-[#7ea2d4]/25 hover:shadow-xl hover:shadow-[#7ea2d4]/30"
                    : "border border-white/20 bg-white/5 text-white hover:border-white/30 hover:bg-white/10"
                }`}
              >
                Boshlash
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
            </div>

            {/* View All Pricing Button */}
            <div className="mt-12 text-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-4 font-semibold text-white transition-all hover:border-white/30 hover:bg-white/10"
              >
                Barcha tariflar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
