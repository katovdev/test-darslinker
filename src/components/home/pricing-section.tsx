"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
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
        <div className="rounded-[40px] bg-white px-6 py-16 dark:bg-[#232324] sm:px-8 lg:px-12 lg:py-20">
          <div className="mx-auto">
            {/* Section header */}
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:gap-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl lg:text-5xl">
                Mos tarifni tanlang
              </h2>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-8 py-4 font-semibold text-gray-900 transition-all hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Batafsil ma&apos;lumot
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Pricing Cards */}
            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.nameKey}
              className={`group relative flex w-full max-w-xs flex-col rounded-2xl border-2 p-6 transition-all duration-300 cursor-pointer ${
                plan.recommended
                  ? "bg-gray-50 shadow-lg dark:bg-white/5"
                  : "bg-gray-50/50 dark:bg-white/[0.025]"
              } ${
                index === 0 ? "lg:ml-auto" : index === 2 ? "lg:mr-auto" : "mx-auto"
              }`}
              style={{
                borderColor: plan.recommended ? "rgba(126, 162, 212, 0.5)" : "rgba(209, 213, 219, 0.5)",
                transition: "border-color 0.3s ease"
              }}
              onClick={() => router.push("/pricing")}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = plan.recommended
                  ? "rgba(126, 162, 212, 1)"
                  : "rgba(107, 114, 128, 1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = plan.recommended
                  ? "rgba(126, 162, 212, 0.5)"
                  : "rgba(209, 213, 219, 0.5)";
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
              <div className="mb-6">
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {t(`pricing.${plan.nameKey}`)}
                </h3>
              </div>

              {/* Features */}
              <ul className="mb-6 flex-1 space-y-3">
                {/* Show features */}
                {plan.displayFeatures.map((feature) => (
                  <li
                    key={feature.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-600 dark:text-white/70">
                      {feature.label}
                    </span>
                    {renderFeatureValue(feature)}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="mb-4 mt-auto">
                {plan.price === "free" ? (
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    Bepul
                  </span>
                ) : plan.price === "custom" ? (
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {t("pricing.contactUs")}
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-white/60">
                      so&apos;m/{t("pricing.perMonth")}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Button - Goes to full pricing page */}
              <Link
                href="/pricing"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.recommended
                    ? "bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] text-white shadow-lg shadow-[#7ea2d4]/25 hover:shadow-xl hover:shadow-[#7ea2d4]/30"
                    : "border border-gray-300 bg-gray-100 text-gray-900 hover:border-gray-400 hover:bg-gray-200 dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/10"
                }`}
              >
                Tanlash
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
