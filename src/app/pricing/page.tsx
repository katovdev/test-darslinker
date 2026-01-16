"use client";

import Link from "next/link";
import { ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-locale";
import { HomeHeader, HomeFooter } from "@/components/home";

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
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: false },
      { key: "chat", included: false },
      { key: "paymentIntegration", included: false },
      { key: "aiFeatures", included: false },
      { key: "contentSecurity", included: false },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
    ],
  },
  {
    nameKey: "planStandard",
    price: "870,000",
    recommended: true,
    features: [
      { key: "courses", included: "4" },
      { key: "admins", included: "6" },
      { key: "students", included: "unlimited" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: true },
      { key: "chat", included: true },
      { key: "paymentIntegration", included: true },
      { key: "aiFeatures", included: false },
      { key: "contentSecurity", included: false },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
    ],
  },
  {
    nameKey: "planPro",
    price: "1,270,000",
    features: [
      { key: "courses", included: "8" },
      { key: "admins", included: "12" },
      { key: "students", included: "unlimited" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: true },
      { key: "chat", included: true },
      { key: "paymentIntegration", included: true },
      { key: "aiFeatures", included: true },
      { key: "contentSecurity", included: true },
      { key: "customBranding", included: true },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
    ],
  },
  {
    nameKey: "planCorporate",
    price: "custom",
    features: [
      { key: "courses", included: "unlimited" },
      { key: "admins", included: "unlimited" },
      { key: "students", included: "unlimited" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: true },
      { key: "chat", included: true },
      { key: "paymentIntegration", included: true },
      { key: "aiFeatures", included: true },
      { key: "contentSecurity", included: true },
      { key: "customBranding", included: true },
      { key: "seo", included: true },
      { key: "customDomain", included: true },
    ],
  },
];

export default function PricingPage() {
  const t = useTranslations();

  const renderFeatureValue = (feature: PlanFeature) => {
    if (feature.included === "unlimited") {
      return (
        <span className="text-green-400">{t("pricing.unlimited")}</span>
      );
    }
    if (typeof feature.included === "string") {
      return <span className="font-medium text-white">{feature.included}</span>;
    }
    if (feature.included) {
      return <Check className="h-5 w-5 text-green-400" />;
    }
    return <X className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Back Button */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white sm:text-5xl">
              {t("pricing.title")}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              {t("pricing.subtitle")}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.nameKey}
                className={`relative flex flex-col rounded-2xl border ${
                  plan.recommended
                    ? "border-[#7EA2D4] bg-gray-800/70"
                    : "border-gray-800 bg-gray-800/30"
                } p-6`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7]">
                    {t("pricing.recommended")}
                  </Badge>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-semibold text-white">
                  {t(`pricing.${plan.nameKey}`)}
                </h3>

                {/* Price */}
                <div className="mt-4">
                  {plan.price === "custom" ? (
                    <span className="text-2xl font-bold text-white">
                      {t("pricing.contactUs")}
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="ml-1 text-gray-400">
                        so&apos;m/{t("pricing.perMonth")}
                      </span>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-400">
                        {t(`pricing.${feature.key}`)}
                      </span>
                      {renderFeatureValue(feature)}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  asChild
                  className={`mt-8 w-full ${
                    plan.recommended
                      ? "bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  <Link href="/register">
                    {plan.price === "custom"
                      ? t("pricing.contactUs")
                      : t("pricing.choosePlan")}
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
