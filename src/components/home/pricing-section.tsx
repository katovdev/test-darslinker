"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, ArrowRight, Sparkles, X, MessageCircle, FileText, ChevronDown } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

interface PlanFeature {
  key: string;
  label: string;
  included: boolean | string;
}

interface Plan {
  nameKey: string;
  price: string;
  description: string;
  recommended?: boolean;
  includesAllFrom?: string;
  displayFeatures: PlanFeature[];
}

const plans: Plan[] = [
  {
    nameKey: "planMinimal",
    price: "free",
    description: "Dars berishni endi boshlaganlar va kichik auditoriya bilan ishlovchi o'qituvchilar uchun",
    displayFeatures: [
      { key: "courses", label: "Kurslar", included: "1" },
      { key: "admins", label: "Adminlar", included: "1" },
      { key: "students", label: "O'quvchilar", included: "20" },
      { key: "contentSecurity", label: "Kontent xavfsizligi", included: true },
      { key: "support", label: "Qo'llab-quvvatlash", included: true },
      { key: "studentAnalytics", label: "O'quvchilar tahlili", included: true },
      { key: "telegramBot", label: "Telegram bot", included: true },
    ],
  },
  {
    nameKey: "planStandard",
    price: "670,000",
    description: "Doimiy o'quvchilar bazasiga ega va kurslar sonini ko'paytirmoqchi bo'lgan faol o'qituvchilar uchun",
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
    description: "Professional ta'lim biznesini yuritayotgan va bozorda o'z o'rnini mustahkamlamoqchi bo'lganlar uchun",
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
  const { theme } = useTheme();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleCard = (index: number) => {
    if (expandedCard === index) {
      setExpandedCard(null);
    } else {
      setExpandedCard(index);
      // Scroll to center after state update and animation
      setTimeout(() => {
        const card = cardRefs.current[index];
        if (card) {
          card.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 50);
    }
  };

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
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <Check className="h-3 w-3 text-white" />
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
      className="relative px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
      style={{ scrollMarginTop: "40px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="sm:rounded-[32px] lg:rounded-[40px] sm:bg-gradient-to-br sm:from-[#7ea2d4] sm:to-[#5b8ac4] px-0 py-4 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="mx-auto">
            {/* Section header - Desktop only */}
            <div className="hidden sm:grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              {/* Button aligned with first card's left edge */}
              <div className="hidden lg:flex w-full max-w-xs ml-auto justify-start items-center">
                <Link
                  href="/#contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" />
                  Konsultatsiya olish
                </Link>
              </div>
              {/* Title centered */}
              <h2 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl lg:text-5xl text-center">
                Mos tarifni tanlang
              </h2>
              {/* Button aligned with third card's right edge */}
              <div className="hidden lg:flex w-full max-w-xs mr-auto justify-end items-center">
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 whitespace-nowrap"
                >
                  <FileText className="h-4 w-4" />
                  Batafsil ma&apos;lumot
                </Link>
              </div>
            </div>

            {/* Mobile Pricing Cards - Accordion style with blue background */}
            <div className="sm:hidden rounded-[20px] bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] p-4">
              {/* Mobile Title - inside blue background */}
              <h2 className="text-2xl font-bold text-white text-center mb-4">
                Mos tarifni tanlang
              </h2>
              <div className="flex flex-col gap-4">
                {plans.map((plan, index) => {
                  const isExpanded = expandedCard === index;

                  return (
                    <div
                      key={plan.nameKey}
                      ref={(el) => { cardRefs.current[index] = el; }}
                      className={`relative rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
                        plan.recommended
                          ? "bg-white/10 border-white/30"
                          : "bg-white/5 border-white/20"
                      }`}
                    >
                      {/* Recommended Badge */}
                      {plan.recommended && (
                        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-10">
                          <div className="inline-flex items-center gap-1 rounded-b-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-2 py-0.5 text-[10px] font-semibold text-white shadow-md">
                            <Sparkles className="h-2.5 w-2.5" />
                            Tavsiya
                          </div>
                        </div>
                      )}

                      {/* Compact Header - Always visible, entire card is clickable */}
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() => toggleCard(index)}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white">
                              {t(`pricing.${plan.nameKey}`)}
                            </h3>
                            <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
                              {plan.description}
                            </p>
                          </div>
                          <button
                            className={`flex items-center justify-center gap-1 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-white/20 ${
                              isExpanded ? "bg-white/20" : ""
                            }`}
                          >
                            Ko'proq
                            <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* Expandable Content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="px-4 pb-4 border-t border-white/10 pt-3">
                          {/* Features */}
                          <ul className="space-y-2 mb-4">
                            {plan.displayFeatures.map((feature) => (
                              <li
                                key={feature.key}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="text-white/70">
                                  {feature.label}
                                </span>
                                {renderFeatureValue(feature)}
                              </li>
                            ))}
                          </ul>

                          {/* Price */}
                          <div className="mb-3 pt-2 border-t border-white/10">
                            {plan.price === "free" ? (
                              <span className="text-lg font-bold text-white">
                                Bepul
                              </span>
                            ) : (
                              <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-white">
                                  {plan.price}
                                </span>
                                <span className="text-xs text-white/60">
                                  so&apos;m/oy
                                </span>
                              </div>
                            )}
                          </div>

                          {/* CTA Button */}
                          <Link
                            href="/pricing"
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all bg-white text-[#7ea2d4] shadow-lg hover:bg-white/90"
                          >
                            Tanlash
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Action Buttons - Below cards, inside blue background */}
              <div className="mt-4 flex gap-2">
                <Link
                  href="/#contact"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  Konsultatsiya
                </Link>
                <Link
                  href="/pricing"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20"
                >
                  <FileText className="h-4 w-4" />
                  Batafsil
                </Link>
              </div>
            </div>

            {/* Desktop Pricing Cards */}
            <div className="mt-12 hidden sm:grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan, index) => {
                const defaultBorderColor = plan.recommended ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)";
                const hoverBorderColor = "rgba(255, 255, 255, 0.5)";

                return (
                  <div
                    key={plan.nameKey}
                    className={`group relative flex w-full sm:max-w-xs flex-col rounded-2xl border-2 p-4 sm:p-6 transition-all duration-300 cursor-pointer ${
                      plan.recommended
                        ? "bg-white/10 shadow-lg"
                        : "bg-white/5"
                    } ${
                      index === 0 ? "lg:ml-auto" : index === 2 ? "lg:mr-auto" : "mx-auto"
                    }`}
                    style={{
                      borderColor: defaultBorderColor,
                      transition: "border-color 0.3s ease"
                    }}
                    onClick={() => router.push("/pricing")}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = hoverBorderColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = defaultBorderColor;
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

                    {/* Plan Name & Description */}
                    <div className="mb-6">
                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                        {t(`pricing.${plan.nameKey}`)}
                      </h3>
                      <p className="mt-2 text-sm text-white/70 leading-relaxed rounded-lg bg-white/10 px-3 py-2">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="mb-6 flex-1 space-y-3">
                      {plan.displayFeatures.map((feature) => (
                        <li
                          key={feature.key}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-white/80">
                            {feature.label}
                          </span>
                          {renderFeatureValue(feature)}
                        </li>
                      ))}
                    </ul>

                    {/* Price */}
                    <div className="mb-4 mt-auto">
                      {plan.price === "free" ? (
                        <span className="text-xl sm:text-xl lg:text-2xl font-bold text-white">
                          Bepul
                        </span>
                      ) : plan.price === "custom" ? (
                        <span className="text-xl sm:text-xl lg:text-2xl font-bold text-white">
                          {t("pricing.contactUs")}
                        </span>
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-xl lg:text-2xl font-bold text-white">
                            {plan.price}
                          </span>
                          <span className="text-xs text-white/70">
                            so&apos;m/{t("pricing.perMonth")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Link
                      href="/pricing"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                        plan.recommended
                          ? "bg-white text-[#7ea2d4] shadow-lg hover:bg-white/90"
                          : "border border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20"
                      }`}
                    >
                      Tanlash
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
