"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, Sparkles, Loader2, ArrowRight } from "lucide-react";
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
  allFeatures: PlanFeature[];
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "Bepul",
    allFeatures: [
      { key: "courses", included: "1" },
      { key: "admins", included: "1" },
      { key: "students", included: "20/oy" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "telegramBot", included: true },
      { key: "contentSecurity", included: true },
      { key: "onlineMeetings", included: false },
      { key: "certificates", included: false },
      { key: "paymentIntegration", included: false },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
    ],
  },
  {
    nameKey: "planStandard",
    price: "670,000",
    recommended: true,
    allFeatures: [
      { key: "courses", included: "3" },
      { key: "admins", included: "3" },
      { key: "students", included: "Cheksiz" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "telegramBot", included: true },
      { key: "contentSecurity", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: true },
      { key: "paymentIntegration", included: true },
      { key: "customBranding", included: false },
      { key: "seo", included: false },
    ],
  },
  {
    nameKey: "planPro",
    price: "1,270,000",
    allFeatures: [
      { key: "courses", included: "6" },
      { key: "admins", included: "6" },
      { key: "students", included: "Cheksiz" },
      { key: "support", included: true },
      { key: "analytics", included: true },
      { key: "telegramBot", included: true },
      { key: "contentSecurity", included: true },
      { key: "onlineMeetings", included: true },
      { key: "certificates", included: true },
      { key: "paymentIntegration", included: true },
      { key: "customBranding", included: true },
      { key: "seo", included: true },
    ],
  },
];

const featureLabels: Record<string, string> = {
  courses: "Kurslar soni",
  admins: "Adminlar soni",
  students: "O'quvchilar soni",
  support: "Qo'llab-quvvatlash",
  analytics: "O'quvchilar tahlili",
  telegramBot: "Telegram bot",
  contentSecurity: "Kontent xavfsizligi",
  onlineMeetings: "Onlayn uchrashuvlar",
  certificates: "Sertifikatlar",
  paymentIntegration: "To'lov integratsiyasi",
  customBranding: "Shaxsiy brending",
  seo: "SEO",
};

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, isLoading, user } = useAuth();
  const t = useTranslations();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated && user && user.role !== "teacher") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-[#7ea2d4]" />
      </div>
    );
  }

  if (isAuthenticated && user && user.role !== "teacher") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-[#7ea2d4]" />
      </div>
    );
  }

  const renderFeatureValue = (feature: PlanFeature) => {
    if (typeof feature.included === "string") {
      return (
        <span className="text-sm font-semibold text-foreground">
          {feature.included}
        </span>
      );
    }
    if (feature.included === true) {
      return (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7ea2d4]/20 mx-auto">
          <Check className="h-3 w-3 text-[#7ea2d4]" />
        </div>
      );
    }
    return (
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted mx-auto">
        <X className="h-3 w-3 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />

      {/* Pricing Section */}
      <section className="px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Mos tarifni tanlang
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              O'zingizga mos tarifni tanlang va platformani sinab ko'ring
            </p>
          </div>

          {/* Pricing Table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full">
              {/* Header Row with Plan Names and Prices */}
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-4 py-6 text-left text-sm font-medium text-muted-foreground w-1/4">
                    Imkoniyatlar
                  </th>
                  {plans.map((plan) => (
                    <th key={plan.nameKey} className="px-4 py-6 text-center w-1/4">
                      <div className="flex flex-col items-center gap-2">
                        {plan.recommended && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-3 py-1 text-xs font-medium text-white">
                            <Sparkles className="h-3 w-3" />
                            Tavsiya etiladi
                          </span>
                        )}
                        <span className="text-xl sm:text-2xl font-bold text-foreground">
                          {t(`pricing.${plan.nameKey}`)}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-bold text-foreground">
                            {plan.price}
                          </span>
                          {plan.price !== "Bepul" && (
                            <span className="text-sm text-muted-foreground">so'm/oy</span>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Feature Rows */}
              <tbody className="divide-y divide-border">
                {Object.keys(featureLabels).map((featureKey) => (
                  <tr key={featureKey} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {featureLabels[featureKey]}
                    </td>
                    {plans.map((plan) => {
                      const feature = plan.allFeatures.find((f) => f.key === featureKey);
                      return (
                        <td key={plan.nameKey} className="px-4 py-4 text-center">
                          {feature ? renderFeatureValue(feature) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted mx-auto">
                              <X className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>

              {/* CTA Row */}
              <tfoot>
                <tr className="border-t border-border">
                  <td className="px-4 py-6"></td>
                  {plans.map((plan) => (
                    <td key={plan.nameKey} className="px-4 py-6 text-center">
                      <Link
                        href="/register"
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                          plan.recommended
                            ? "bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] text-white shadow-lg shadow-[#7ea2d4]/25 hover:shadow-xl hover:shadow-[#7ea2d4]/30"
                            : "border border-border bg-secondary text-foreground hover:border-[#7ea2d4] hover:bg-secondary/80"
                        }`}
                      >
                        Tanlash
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Savollaringiz bormi?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Biz bilan bog'laning, sizga yordam berishdan mamnunmiz
          </p>
          <Link
            href="/#contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-8 py-4 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30"
          >
            Bog'lanish
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}
