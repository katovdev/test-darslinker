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
  includesAllFrom?: string;
  displayFeatures: PlanFeature[];
  allFeatures: PlanFeature[]; // For comparison table
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "470,000",
    color: "gray",
    displayFeatures: [
      { key: "courses", included: "2" },
      { key: "admins", included: "3" },
      { key: "students", included: "unlimited" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "onlineMeetings", included: true },
    ],
    allFeatures: [
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
    includesAllFrom: "planMinimal",
    displayFeatures: [
      { key: "courses", included: "4" },
      { key: "admins", included: "6" },
      { key: "students", included: "unlimited" },
      { key: "certificates", included: true },
      { key: "chat", included: true },
      { key: "paymentIntegration", included: true },
    ],
    allFeatures: [
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
    includesAllFrom: "planStandard",
    displayFeatures: [
      { key: "courses", included: "8" },
      { key: "admins", included: "12" },
      { key: "students", included: "unlimited" },
      { key: "contentSecurity", included: true },
      { key: "customBranding", included: true },
    ],
    allFeatures: [
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
    includesAllFrom: "planPro",
    displayFeatures: [
      { key: "courses", included: "unlimited" },
      { key: "admins", included: "unlimited" },
      { key: "students", included: "unlimited" },
      { key: "seo", included: true },
      { key: "customDomain", included: true },
      { key: "aiFeatures", included: true },
    ],
    allFeatures: [
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
      <div className="flex min-h-screen items-center justify-center bg-background">
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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-purple-500" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

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
    if (feature.included) {
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20">
          <Check className="h-3 w-3 text-green-500" />
        </div>
      );
    }
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
        <X className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-500">
            {t("pricing.title")}
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground sm:text-5xl lg:text-6xl">
            {t("pricing.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
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

                {/* Features List */}
                <ul className="mb-6 space-y-3">
                  {/* Show "includes all from" message if applicable */}
                  {plan.includesAllFrom && (
                    <li className="flex items-start gap-2 rounded-lg bg-primary/5 p-2 text-xs text-primary">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>
                        {t(`pricing.${plan.includesAllFrom}`)} {t("pricing.allFeatures") || "ning barcha imkoniyatlari"}
                      </span>
                    </li>
                  )}

                  {/* Show only new features for this plan */}
                  {plan.displayFeatures.map((feature) => (
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

                {/* CTA Button */}
                <Link
                  href="/register"
                  className={`inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    plan.recommended
                      ? "bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] text-white shadow-lg shadow-[#7ea2d4]/25 hover:shadow-xl hover:shadow-[#7ea2d4]/30"
                      : "border border-border bg-secondary text-foreground hover:border-primary hover:bg-secondary/80"
                  }`}
                >
                  {plan.price === "custom"
                    ? t("pricing.contactUs")
                    : t("pricing.choosePlan")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Comparison Table */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground">
              Batafsil Taqqoslash
            </h2>
            <p className="mt-2 text-muted-foreground">
              Barcha imkoniyatlarni taqqoslang va o'zingizga mos tarifni tanlang
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Imkoniyatlar
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.nameKey}
                      className="px-6 py-4 text-center text-sm font-semibold text-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span>{t(`pricing.${plan.nameKey}`)}</span>
                        {plan.recommended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-2 py-0.5 text-xs font-medium text-white">
                            <Sparkles className="h-2.5 w-2.5" />
                            Tavsiya
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {/* Basic Features */}
                <tr>
                  <td
                    colSpan={5}
                    className="bg-secondary/30 px-6 py-3 text-sm font-semibold text-foreground"
                  >
                    Asosiy Imkoniyatlar
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Kurslar soni
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "courses")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    O'qituvchilar/Adminlar soni
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "admins")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    O'quvchilar soni
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "students")!
                      )}
                    </td>
                  ))}
                </tr>

                {/* Platform Features */}
                <tr>
                  <td
                    colSpan={5}
                    className="bg-secondary/30 px-6 py-3 text-sm font-semibold text-foreground"
                  >
                    Platforma Imkoniyatlari
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Texnik yordam
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "support")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Tahlil va hisobotlar
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "analytics")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Onlayn uchrashuvlar
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "onlineMeetings")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Sertifikatlar
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "certificates")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Chat tizimi
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "chat")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    To'lov integratsiyasi
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "paymentIntegration")!
                      )}
                    </td>
                  ))}
                </tr>

                {/* Advanced Features */}
                <tr>
                  <td
                    colSpan={5}
                    className="bg-secondary/30 px-6 py-3 text-sm font-semibold text-foreground"
                  >
                    Qo'shimcha Imkoniyatlar
                  </td>
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Kontent himoyasi
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "contentSecurity")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    O'z brendingiz
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "customBranding")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    SEO optimallashtirish
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "seo")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    O'z domeningiz
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "customDomain")!
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-secondary/20 transition-colors">
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    AI yordamchisi
                  </td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-6 py-4 text-center">
                      {renderFeatureValue(
                        plan.allFeatures.find((f) => f.key === "aiFeatures")!
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ or Additional Info Section */}
      <section className="border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {t("home.contactTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">{t("home.contactSubtitle")}</p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-8 py-4 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30"
          >
            {t("home.contactSubmit")}
          </Link>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
