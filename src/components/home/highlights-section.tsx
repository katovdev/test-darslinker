"use client";

import { BookOpen, Shield, TrendingUp, CreditCard } from "lucide-react";
import CardSwap, { Card } from "@/components/ui/card-swap";

export function HighlightsSection() {
  return (
    <section className="relative px-4 py-12 sm:px-6 sm:py-16 lg:hidden lg:px-8 mobile-card-swap-section">
      <style jsx global>{`
        .mobile-card-swap-section .card-swap-container {
          display: block !important;
          position: relative !important;
          top: 50% !important;
          right: auto !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
        }
      `}</style>
      <div className="mx-auto max-w-6xl flex justify-center">
        <div className="relative w-full" style={{ height: '450px', maxWidth: '400px' }}>
          <CardSwap
            width={340}
            height={220}
            cardDistance={20}
            verticalDistance={60}
            delay={2500}
            pauseOnHover={false}
            skewAmount={1.5}
            easing="smooth"
          >
            {/* Card 1 - Courses */}
            <Card customClass="!border-2 !border-[#7ea2d4]/25">
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7ea2d4] to-[#5b8ac4] shadow-lg shadow-[#7ea2d4]/50">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      Cheksiz Kurslar
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Cheksiz video darslar joylash imkoniyati
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#7ea2d4]" />
                  <span>Video, quiz, topshiriqlar va sertifikatlar</span>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-[#7ea2d4]/30 to-transparent blur-3xl" />
              </div>
            </Card>

            {/* Card 2 - Security */}
            <Card customClass="!border-2 !border-green-500/25">
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/50">
                    <Shield className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      To'liq Xavfsizlik
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Barcha video darslaringiz himoyalanadi
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  <span>DRM himoya va suv belgisi</span>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/30 to-transparent blur-3xl" />
              </div>
            </Card>

            {/* Card 3 - Progress */}
            <Card customClass="!border-2 !border-orange-500/25">
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/50">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      Smart Progress
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      O'quvchilaringizni to'liq nazorat qiling
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>Real-time tahlil va statistika</span>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-orange-500/30 to-transparent blur-3xl" />
              </div>
            </Card>

            {/* Card 4 - Payment System */}
            <Card customClass="!border-2 !border-purple-500/25">
              <div className="flex h-full flex-col justify-between p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg shadow-purple-500/50">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-bold text-foreground">
                      To'lov tizimi
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      To'lovlarni Uzcard, Humo orqali avtomatlashtiring
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground/60">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                  <span>Xavfsiz va tezkor to'lovlar</span>
                </div>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/30 to-transparent blur-3xl" />
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>
  );
}
