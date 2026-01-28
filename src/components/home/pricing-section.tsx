"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

interface PlanFeature {
  key: string;
  included: boolean | string;
}

interface Plan {
  nameKey: string;
  price: string;
  recommended?: boolean;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "470,000",
    features: [
      { key: "courses", included: "2" },
      { key: "admins", included: "3" },
      { key: "students", included: "unlimited" },
    ],
  },
  {
    nameKey: "planStandard",
    price: "870,000",
    recommended: true,
    features: [
      { key: "courses", included: "4" },
      { key: "admins", included: "6" },
      { key: "certificates", included: true },
    ],
  },
  {
    nameKey: "planPro",
    price: "1,270,000",
    features: [
      { key: "courses", included: "8" },
      { key: "admins", included: "12" },
      { key: "customBranding", included: true },
    ],
  },
  {
    nameKey: "planCorporate",
    price: "custom",
    features: [
      { key: "courses", included: "unlimited" },
      { key: "admins", included: "unlimited" },
      { key: "aiFeatures", included: true },
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
        <span className="text-sm font-semibold text-foreground">
          {feature.included}
        </span>
      );
    }
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
        <Check className="h-3 w-3 text-green-500" />
      </div>
    );
  };

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-secondary/30" />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-500">
            {t("pricing.title")}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {t("pricing.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.nameKey}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                plan.recommended
                  ? "border-primary/50 bg-gradient-to-b from-primary/10 to-card shadow-lg"
                  : "border-border bg-card hover:border-primary/30 hover:shadow-md"
              }`}
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
              <h3 className="text-xl font-semibold text-foreground">
                {t(`pricing.${plan.nameKey}`)}
              </h3>

              {/* Price */}
              <div className="mt-4 mb-6">
                {plan.price === "custom" ? (
                  <span className="text-2xl font-bold text-foreground">
                    {t("pricing.contactUs")}
                  </span>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      so&apos;m/{t("pricing.perMonth")}
                    </span>
                  </div>
                )}
              </div>

              {/* Features (Limited for home page) */}
              <ul className="mb-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">
                      {t(`pricing.${feature.key}`)}
                    </span>
                    {renderFeatureValue(feature)}
                  </li>
                ))}
              </ul>

              {/* CTA Button - Goes to full pricing page */}
              <Link
                href="/pricing"
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  plan.recommended
                    ? "bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] text-white shadow-lg shadow-[#7ea2d4]/25 hover:shadow-xl hover:shadow-[#7ea2d4]/30"
                    : "border border-border bg-secondary text-foreground hover:border-primary hover:bg-secondary/80"
                }`}
              >
                {t("pricing.viewDetails") || "Batafsil"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* View All Pricing Link */}
        <div className="mt-12 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
          >
            {t("pricing.viewAllPlans") || "Barcha tariflarni ko'rish"}
            <ArrowRight className="h-4 w-4 transition-transform hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
