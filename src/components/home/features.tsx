"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

// Check if we're on mobile - more reliable detection
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  // Check both width and touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 640;
  return isSmallScreen || (hasTouch && window.innerWidth < 768);
};

// Smooth scroll helper
const smoothScrollTo = (element: HTMLElement, target: number, duration: number = 300) => {
  const start = element.scrollTop;
  const change = target - start;
  const startTime = performance.now();

  const animateScroll = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    element.scrollTop = start + change * easeOut;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [itemStyles, setItemStyles] = useState<{ scale: number; opacity: number }[]>(
    features.map((_, index) => {
      // Initial styles - first item is largest, decreasing down
      const distanceFromTop = index / 3; // 0 for first, increases for others
      const clampedDistance = Math.min(1, distanceFromTop);
      return {
        scale: 1 - (clampedDistance * 0.12),
        opacity: 1 - (clampedDistance * 0.4)
      };
    })
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollTime = useRef<number>(0);

  const calculateItemStyles = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? Math.min(scrollTop / 50, 1) : 0;
    setScrollProgress(progress);
    setIsAtTop(scrollTop < 10);
    setIsAtBottom(scrollTop >= maxScroll - 10);

    const containerRect = container.getBoundingClientRect();
    // Dynamic focal point: moves from 25% at top to 75% at bottom based on scroll
    const scrollRatio = maxScroll > 0 ? scrollTop / maxScroll : 0;
    const focalPointY = clientHeight * (0.25 + scrollRatio * 0.5); // 25% -> 75%

    const newStyles = itemRefs.current.map((itemRef) => {
      if (!itemRef) return { scale: 1, opacity: 1 };

      const itemRect = itemRef.getBoundingClientRect();
      const itemCenter = itemRect.top + itemRect.height / 2 - containerRect.top;

      // Distance from focal point (0 = at focal point, 1 = far from it)
      const distanceFromFocal = Math.abs(itemCenter - focalPointY) / (clientHeight * 0.5);
      const clampedDistance = Math.min(1, distanceFromFocal);

      // Items at focal point are full size, items away are smaller
      const scale = 1 - (clampedDistance * 0.12);
      const opacity = 1 - (clampedDistance * 0.4);

      return { scale, opacity };
    });

    setItemStyles(newStyles);
  }, []);

  const handleScroll = () => {
    calculateItemStyles();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateItemStyles();
    }, 100);
    return () => clearTimeout(timer);
  }, [calculateItemStyles]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice());
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-scroll animation for mobile - continuous animation, no manual scroll
  useEffect(() => {
    if (!isMobile) return;

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let isRunning = true;
    let direction = 1; // 1 = down, -1 = up
    const SPEED = 0.5;

    const animate = () => {
      if (!isRunning) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;

      // Reverse at boundaries
      if (scrollTop >= maxScroll - 1) {
        direction = -1;
      } else if (scrollTop <= 1) {
        direction = 1;
      }

      scrollContainer.scrollTop = scrollTop + (SPEED * direction);
      calculateItemStyles();

      requestAnimationFrame(animate);
    };

    // Start animation with delays for mobile browser compatibility
    const timers = [
      setTimeout(() => { if (isRunning) requestAnimationFrame(animate); }, 100),
      setTimeout(() => { if (isRunning) requestAnimationFrame(animate); }, 500),
      setTimeout(() => { if (isRunning) requestAnimationFrame(animate); }, 1000),
    ];

    return () => {
      isRunning = false;
      timers.forEach(t => clearTimeout(t));
    };
  }, [isMobile, calculateItemStyles]);

  return (
    <section
      ref={sectionRef}
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
            {/* Section subtitle - inside dark box */}
            <div className="mb-6 text-center sm:mb-12 lg:mb-16">
              {/* Mobile title */}
              <p className="text-3xl font-bold text-foreground sm:hidden">
                Asosiy imkoniyatlar
              </p>
              {/* Desktop title */}
              <p className="hidden sm:block text-3xl md:text-4xl lg:text-5xl font-bold text-foreground whitespace-nowrap">
                Platformaning asosiy imkoniyatlari
              </p>
            </div>

            {/* Features - Scrollable list on mobile, grid on desktop */}
            {/* Mobile scrollable container - shows 4 items, scroll for more */}
            <div className="sm:hidden relative -mx-4">
              {/* Top fade overlay */}
              <div
                className="absolute -top-1 left-0 right-0 h-16 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, var(--background) 0%, var(--background) 60%, transparent 100%)'
                }}
              />
              {/* Bottom fade overlay */}
              <div
                className="absolute -bottom-1 left-0 right-0 h-16 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, var(--background) 0%, var(--background) 60%, transparent 100%)'
                }}
              />
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="max-h-[520px] overflow-y-scroll flex flex-col gap-4 scrollbar-hide px-4"
                style={{ touchAction: 'none', overscrollBehavior: 'none' }}
              >
                {/* Invisible spacer for top fade area */}
                <div className="h-12 flex-shrink-0" aria-hidden="true" />
                {features.map((feature, index) => (
                  <div
                    key={feature.key}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className="group relative flex items-start gap-4 rounded-2xl bg-[#7ea2d4]/10 dark:bg-card p-5 backdrop-blur-sm flex-shrink-0"
                    style={{
                      transform: `scale(${itemStyles[index]?.scale || 1})`,
                      opacity: itemStyles[index]?.opacity || 1,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out, opacity 0.15s ease-out'
                    }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
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
                {/* Invisible spacer for bottom fade area */}
                <div className="h-12 flex-shrink-0" aria-hidden="true" />
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
