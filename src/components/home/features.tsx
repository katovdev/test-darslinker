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

// Check if we're on mobile
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 640; // sm breakpoint
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

  // Scroll hijacking for mobile - lock body scroll when in features section
  useEffect(() => {
    if (!isMobile) return;

    const section = sectionRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!section || !scrollContainer) return;

    let isLockedRef = false;
    let lastTouchY = 0;
    let velocity = 0;
    let animationId: number | null = null;
    let lastTime = 0;

    const checkAndLock = () => {
      const sectionRect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Section should be visible and taking up most of the viewport
      const sectionVisibleTop = Math.max(0, sectionRect.top);
      const sectionVisibleBottom = Math.min(viewportHeight, sectionRect.bottom);
      const visibleHeight = sectionVisibleBottom - sectionVisibleTop;
      const isLargelyVisible = visibleHeight > viewportHeight * 0.5;

      // Check if section top is above viewport center
      const isSectionCentered = sectionRect.top <= viewportHeight * 0.4 && sectionRect.bottom >= viewportHeight * 0.6;

      return isSectionCentered && isLargelyVisible;
    };

    // Momentum animation
    const animateMomentum = () => {
      if (Math.abs(velocity) < 0.5) {
        velocity = 0;
        animationId = null;
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;

      // Apply friction
      velocity *= 0.95;

      const newScrollTop = Math.max(0, Math.min(maxScroll, scrollTop + velocity));
      scrollContainer.scrollTop = newScrollTop;

      // Check if at boundaries
      if (newScrollTop <= 0 || newScrollTop >= maxScroll) {
        velocity = 0;
        isLockedRef = false;
        setIsLocked(false);
        animationId = null;
        return;
      }

      animationId = requestAnimationFrame(animateMomentum);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Stop any ongoing momentum
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      velocity = 0;

      lastTouchY = e.touches[0].clientY;
      lastTime = performance.now();

      if (checkAndLock()) {
        isLockedRef = true;
        setIsLocked(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isLockedRef) {
        if (checkAndLock()) {
          isLockedRef = true;
          setIsLocked(true);
          lastTouchY = e.touches[0].clientY;
          lastTime = performance.now();
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const currentTime = performance.now();
      const deltaY = lastTouchY - currentY;
      const deltaTime = currentTime - lastTime;

      // Calculate velocity for momentum
      if (deltaTime > 0) {
        velocity = deltaY / deltaTime * 16; // Normalize to ~60fps
      }

      lastTouchY = currentY;
      lastTime = currentTime;

      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const maxScroll = scrollHeight - clientHeight;

      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      const atTop = scrollTop <= 2;
      const atBottom = scrollTop >= maxScroll - 2;

      // If at boundary and trying to scroll past, release lock
      if ((isScrollingDown && atBottom) || (isScrollingUp && atTop)) {
        isLockedRef = false;
        setIsLocked(false);
        velocity = 0;
        return;
      }

      // Prevent page scroll and scroll the container instead
      e.preventDefault();

      // Apply scroll directly
      const newScrollTop = Math.max(0, Math.min(maxScroll, scrollTop + deltaY));
      scrollContainer.scrollTop = newScrollTop;
    };

    const handleTouchEnd = () => {
      // Start momentum animation if there's velocity
      if (Math.abs(velocity) > 2 && isLockedRef) {
        animationId = requestAnimationFrame(animateMomentum);
      } else {
        // Check if should unlock
        setTimeout(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          const maxScroll = scrollHeight - clientHeight;
          const atTop = scrollTop <= 2;
          const atBottom = scrollTop >= maxScroll - 2;

          if (atTop || atBottom) {
            isLockedRef = false;
            setIsLocked(false);
          }
        }, 100);
      }
    };

    const handleWindowScroll = () => {
      // If page is being scrolled and we should lock, scroll to section
      if (!isLockedRef && checkAndLock()) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const maxScroll = scrollHeight - clientHeight;

        // Only lock if there's content to scroll
        if (maxScroll > 10 && scrollTop < maxScroll - 5) {
          isLockedRef = true;
          setIsLocked(true);
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative z-0 bg-background px-4 pt-12 pb-16 sm:px-6 lg:px-8 lg:pt-24 lg:pb-20"
      style={{ scrollMarginTop: "64px" }}
    >
      <div className="mx-auto max-w-[1400px]">
        <div
          className="overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px] border-2 px-4 pt-8 pb-12 sm:px-8 sm:pt-12 lg:px-12 lg:pt-16 lg:pb-20"
          style={{ borderColor: "#7ea2d4" }}
        >
          <div className="mx-auto">
            {/* Section subtitle - inside dark box */}
            <div className="mb-6 text-center sm:mb-12 lg:mb-16">
              <p className="text-lg font-bold sm:text-3xl md:text-4xl lg:text-5xl text-foreground whitespace-nowrap">
                Platformaning asosiy imkoniyatlari
              </p>
            </div>

            {/* Features - Scrollable list on mobile, grid on desktop */}
            {/* Mobile scrollable container - shows 3 items, scroll for more */}
            <div className="sm:hidden relative -mx-4">
              {/* Top blur overlay */}
              <div
                className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, var(--background) 0%, transparent 100%)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
                }}
              />
              {/* Bottom blur overlay */}
              <div
                className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)'
                }}
              />
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="max-h-[360px] overflow-y-auto flex flex-col gap-3 scrollbar-hide px-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* Invisible spacer for top blur area */}
                <div className="h-14 flex-shrink-0" aria-hidden="true" />
                {features.map((feature, index) => (
                  <div
                    key={feature.key}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className="group relative flex items-start gap-3 rounded-xl border border-border bg-card p-3 backdrop-blur-sm flex-shrink-0"
                    style={{
                      transform: `scale(${itemStyles[index]?.scale || 1})`,
                      opacity: itemStyles[index]?.opacity || 1,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease-out, opacity 0.15s ease-out'
                    }}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t(`home.${feature.key}`)}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground mt-0.5 line-clamp-2 min-h-[2.5em]">
                        {t(`home.${feature.key}Desc`)}
                      </p>
                    </div>

                    {/* Number indicator */}
                    <div className="flex-shrink-0 text-2xl font-bold text-primary/15">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>
                ))}
                {/* Invisible spacer for bottom blur area */}
                <div className="h-14 flex-shrink-0" aria-hidden="true" />
              </div>
              {/* Scroll indicator - always takes space, visibility changes */}
              <div
                className="flex justify-center mt-2"
                style={{ visibility: isAtBottom ? 'hidden' : 'visible' }}
              >
                <div className="w-6 h-1 rounded-full bg-primary/30 animate-pulse" />
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
