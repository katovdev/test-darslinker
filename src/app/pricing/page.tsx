"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, Sparkles, Loader2 } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { HomeHeader, HomeFooter } from "@/components/home";

interface PlanFeature {
  key: string;
  included: boolean | string;
}

interface Plan {
  nameKey: string;
  price: string;
  recommended?: boolean;
  color: string;
  features: PlanFeature[];
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "470,000",
    color: "gray",
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
      { key: "contentSecurity", included: false },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
      { key: "aiFeatures", included: false },
    ],
  },
  {
    nameKey: "planStandard",
    price: "870,000",
    recommended: true,
    color: "blue",
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
      { key: "contentSecurity", included: false },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
      { key: "aiFeatures", included: false },
    ],
  },
  {
    nameKey: "planPro",
    price: "1,270,000",
    color: "purple",
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
      { key: "contentSecurity", included: true },
      { key: "customBranding", included: true },
      { key: "seo", included: false },
      { key: "customDomain", included: false },
      { key: "aiFeatures", included: false },
    ],
  },
  {
    nameKey: "planCorporate",
    price: "custom",
    color: "yellow",
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
      { key: "contentSecurity", included: true },
      { key: "customBranding", included: true },
      { key: "seo", included: true },
      { key: "customDomain", included: true },
      { key: "aiFeatures", included: true },
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, isLoading, user } = useAuth();
  const t = useTranslations();

  useEffect(() => {
    // Wait for auth to hydrate
    if (!hasHydrated) return;

    // If authenticated but NOT a teacher, redirect to dashboard
    // Teachers are platform customers and need to see pricing
    // Students, admins, moderators don't need platform pricing
    if (isAuthenticated && user && user.role !== "teacher") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  // Show loading while checking authentication
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-purple-500" />
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting non-teachers
  if (isAuthenticated && user && user.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-purple-500" />
          </div>
          <p className="mt-4 text-sm text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const renderFeatureValue = (feature: PlanFeature) => {
    if (feature.included === "unlimited") {
      return (
        <span className="text-sm font-medium text-green-400">
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
    if (feature.included) {
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-3 w-3 text-green-400" />
        </div>
      );
    }
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800">
        <X className="h-3 w-3 text-gray-600" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-400">
            {t("pricing.title")}
          </span>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {t("pricing.subtitle")}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.nameKey}
                className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 ${
                  plan.recommended
                    ? "border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-gray-800/50"
                    : "border-gray-800 bg-gray-800/30 hover:border-gray-700 hover:bg-gray-800/50"
                }`}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-blue-500/25">
                      <Sparkles className="h-3 w-3" />
                      {t("pricing.recommended")}
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-semibold text-white">
                  {t(`pricing.${plan.nameKey}`)}
                </h3>

                {/* Price */}
                <div className="mt-4 mb-6">
                  {plan.price === "custom" ? (
                    <span className="text-2xl font-bold text-white">
                      {t("pricing.contactUs")}
                    </span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        so&apos;m/{t("pricing.perMonth")}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href="/register"
                  className={`mb-6 inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    plan.recommended
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                      : "border border-gray-700 bg-gray-800 text-white hover:border-gray-600 hover:bg-gray-700"
                  }`}
                >
                  {plan.price === "custom"
                    ? t("pricing.contactUs")
                    : t("pricing.choosePlan")}
                </Link>

                {/* Features */}
                <ul className="flex-1 space-y-3">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="border-t border-gray-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-white">
            {t("home.contactTitle")}
          </h2>
          <p className="mt-4 text-gray-400">{t("home.contactSubtitle")}</p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
          >
            {t("home.contactSubmit")}
          </Link>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
