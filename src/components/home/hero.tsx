"use client";

import Link from "next/link";
import { ArrowRight, Play, Users, BookOpen, Award, Shield, TrendingUp, CreditCard } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import CardSwap, { Card } from "@/components/ui/card-swap";

export function Hero() {
  const t = useTranslations();

  return (
    <section className="relative z-10 px-4 pt-16 pb-24 sm:px-6 sm:pb-28 lg:px-8 lg:pt-24 lg:pb-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-[#7ea2d4] px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#7ea2d4]" />
              <span className="text-sm text-foreground">
                Onlyan kurslarni tizimlashtirish platformasi
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {t("home.heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-8 py-4 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30"
              >
                {t("home.getStarted")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-8 py-4 font-semibold text-foreground transition-all hover:border-primary hover:bg-secondary/80"
              >
                <Play className="h-5 w-5" />
                {t("home.viewPricing")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">500+</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("home.statStudents") || "Students"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold text-foreground">50+</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("home.statCourses") || "Courses"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Award className="h-5 w-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-foreground">100+</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("home.statCertificates") || "Certificates"}
                </p>
              </div>
            </div>
          </div>

          {/* Right content - Card Swap Animation */}
          <div className="relative hidden lg:block" style={{ height: '500px', position: 'relative' }}>
            <CardSwap
              width={450}
              height={270}
              cardDistance={25}
              verticalDistance={75}
              delay={2500}
              pauseOnHover={false}
              skewAmount={1.5}
              easing="smooth"
            >
              {/* Card 1 - Courses */}
              <Card customClass="!border-2 !border-[#7ea2d4]/25">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] shadow-lg shadow-[#7ea2d4]/50">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        Cheksiz Kurslar
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Cheksiz video darslar joylash imkoniyati
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#7ea2d4]" />
                    <span>Video, quiz, topshiriqlar va sertifikatlar</span>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#7ea2d4]/30 to-transparent blur-3xl" />
                </div>
              </Card>

              {/* Card 2 - Security */}
              <Card customClass="!border-2 !border-green-500/25">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        To'liq Xavfsizlik
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Barcha video darslaringiz himoyalanadi
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span>DRM himoya va suv belgisi</span>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/30 to-transparent blur-3xl" />
                </div>
              </Card>

              {/* Card 3 - Progress */}
              <Card customClass="!border-2 !border-orange-500/25">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/50">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        Smart Progress
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        O'quvchilaringizni to'liq nazorat qiling
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span>Real-time tahlil va statistika</span>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/30 to-transparent blur-3xl" />
                </div>
              </Card>

              {/* Card 4 - Payment System */}
              <Card customClass="!border-2 !border-purple-500/25">
                <div className="flex h-full flex-col justify-between p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/50">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-bold text-foreground">
                        To'lov tizimi
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        To'lovlarni Uzcard, Humo orqali avtomatlashtiring
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground/60">
                    <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    <span>Xavfsiz va tezkor to'lovlar</span>
                  </div>
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl" />
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  );
}
