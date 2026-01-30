"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  CreditCard,
  Award,
  MessageSquare,
  Shield,
  ClipboardCheck,
  Play,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

const features = [
  {
    key: "featureCourses",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    iconColor: "#60a5fa",
  },
  {
    key: "featurePayments",
    icon: CreditCard,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    iconColor: "#4ade80",
  },
  {
    key: "featureCertificates",
    icon: Award,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    iconColor: "#facc15",
  },
  {
    key: "featureQuiz",
    icon: ClipboardCheck,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    iconColor: "#c084fc",
  },
  {
    key: "featureChat",
    icon: MessageSquare,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10",
    iconColor: "#f472b6",
  },
  {
    key: "featureSecurity",
    icon: Shield,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    iconColor: "#22d3ee",
  },
  {
    key: "featureVideo",
    icon: Play,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    iconColor: "#f87171",
  },
  {
    key: "featureProgress",
    icon: TrendingUp,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    iconColor: "#fb923c",
  },
  {
    key: "featureAssignments",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    iconColor: "#818cf8",
  },
];

export function Features() {
  const t = useTranslations();
  const [isMobile, setIsMobile] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef(1); // 1 = down, -1 = up

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window === 'undefined') return;
      const isSmall = window.innerWidth < 640;
      setIsMobile(isSmall);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform-based animation for mobile - doesn't block page scroll
  useEffect(() => {
    if (!isMobile) return;

    const CARD_HEIGHT = 100; // approximate card height + gap
    const TOTAL_CARDS = features.length;
    const MAX_TRANSLATE = CARD_HEIGHT * (TOTAL_CARDS - 4); // Show 4 cards
    const SPEED = 0.8;

    let currentY = 0;

    const animate = () => {
      // Update direction at boundaries
      if (currentY >= MAX_TRANSLATE) {
        directionRef.current = -1;
      } else if (currentY <= 0) {
        directionRef.current = 1;
      }

      currentY += SPEED * directionRef.current;
      currentY = Math.max(0, Math.min(MAX_TRANSLATE, currentY));

      setTranslateY(currentY);
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMobile]);


  return (
    <section
      id="features"
      className="relative z-0 bg-background px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-24 lg:pb-20"
      style={{ scrollMarginTop: "64px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          className="overflow-hidden sm:rounded-[32px] lg:rounded-[40px] sm:border-2 px-0 pt-8 pb-12 sm:px-8 sm:pt-12 lg:px-12 lg:pt-16 lg:pb-20"
          style={{ borderColor: "#7ea2d4" }}
        >
          <div className="mx-auto">
            {/* Section subtitle - Desktop only */}
            <div className="hidden sm:block mb-12 text-center lg:mb-16">
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground whitespace-nowrap">
                Platformaning asosiy imkoniyatlari
              </p>
            </div>

            {/* Features - Transform-based animation on mobile, grid on desktop */}
            {/* Mobile container - uses CSS transform for animation, doesn't block page scroll */}
            <div className="sm:hidden relative -mx-4 h-[520px] overflow-hidden">
              {/* Mobile title - positioned at top fade area */}
              <p className="absolute top-0 left-0 right-0 z-20 text-center text-3xl font-bold text-foreground px-4 pt-2">
                Asosiy imkoniyatlar
              </p>
              {/* Top fade overlay */}
              <div
                className="absolute -top-1 left-0 right-0 h-24 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, var(--background) 0%, var(--background) 60%, transparent 100%)'
                }}
              />
              {/* Bottom fade overlay */}
              <div
                className="absolute -bottom-1 left-0 right-0 h-24 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, var(--background) 0%, var(--background) 60%, transparent 100%)'
                }}
              />
              {/* Animated content wrapper */}
              <div
                className="flex flex-col gap-3 px-4 pt-14"
                style={{
                  transform: `translateY(-${translateY}px)`,
                  willChange: 'transform',
                }}
              >
                {features.map((feature, index) => (
                  <div
                    key={feature.key}
                    className="group relative flex items-start gap-4 rounded-2xl bg-[#7ea2d4]/10 dark:bg-card p-5 backdrop-blur-sm"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-foreground">
                        {t(`home.${feature.key}`)}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-1 line-clamp-2">
                        {t(`home.${feature.key}Desc`)}
                      </p>
                    </div>

                    {/* Number indicator */}
                    <div className="flex-shrink-0 text-3xl font-bold text-primary/15">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden sm:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.key}
                  className="group relative rounded-2xl border border-border bg-card p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
                >
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    {t(`home.${feature.key}`)}
                  </h3>
                  <p className="text-base leading-relaxed text-muted-foreground">
                    {t(`home.${feature.key}Desc`)}
                  </p>

                  {/* Number indicator */}
                  <div className="absolute top-6 right-6 text-4xl font-bold text-primary/15">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
