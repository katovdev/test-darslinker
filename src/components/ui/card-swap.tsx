"use client";

import React, { Children, cloneElement, forwardRef, isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import './card-swap.css';

// Check if mobile or tablet
const isMobileOrTablet = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 1024;
};

export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { customClass?: string }>(
  ({ customClass, ...rest }, ref) => (
    <div ref={ref} {...rest} className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()} />
  )
);
Card.displayName = 'Card';

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
  x: i * distX,
  y: -i * distY,
  z: -i * distX * 1.5,
  zIndex: total - i
});

const placeNow = (el: HTMLElement | null, slot: Slot, skew: number, index: number) => {
  if (!el) return;
  // All cards 100% opacity
  const opacity = 1;
  gsap.set(el, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: 'center center',
    zIndex: slot.zIndex,
    opacity: opacity,
    force3D: true
  });
};

interface CardSwapProps {
  width?: number;
  height?: number;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  onCardClick?: (index: number) => void;
  skewAmount?: number;
  easing?: 'elastic' | 'smooth';
  children: React.ReactNode;
}

const CardSwap: React.FC<CardSwapProps> = ({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  onCardClick,
  skewAmount = 6,
  easing = 'elastic',
  children
}) => {
  const config =
    easing === 'elastic'
      ? {
          ease: 'elastic.out(0.6,0.9)',
          durDrop: 2,
          durMove: 2,
          durReturn: 2,
          promoteOverlap: 0.9,
          returnDelay: 0.05
        }
      : {
          ease: 'power2.out',
          durDrop: 0.4,
          durMove: 0.4,
          durReturn: 0.4,
          promoteOverlap: 0.6,
          returnDelay: 0.15
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => React.createRef<HTMLDivElement>()),
    [childArr.length]
  );

  const order = useRef(Array.from({ length: childArr.length }, (_, i) => i));
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't run animations on mobile/tablet
    if (isMobileOrTablet()) return;

    const total = refs.length;
    refs.forEach((r, i) => placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount, i));

    let isScrolling = false;
    let scrollTimeout: number | undefined;
    let isPaused = false;

    const swap = () => {
      if (order.current.length < 2 || isPaused) return;

      const [front, ...rest] = order.current;
      const elFront = refs[front].current;
      if (!elFront) return;

      const tl = gsap.timeline();
      tlRef.current = tl;

      // Move to right with slight upward arc for smooth motion
      tl.to(elFront, {
        x: '+=550',
        y: '-=30',
        opacity: 1,
        duration: config.durDrop,
        ease: config.ease
      });

      // THEN set z-index to -1 so card goes UNDER other cards (after drop completes)
      tl.set(elFront, { zIndex: -1 });

      // Start promoting other cards slightly before drop completes for smooth transition
      tl.addLabel('promote', `-=${config.durDrop * 0.3}`);
      rest.forEach((idx, i) => {
        const el = refs[idx].current;
        if (!el) return;
        const slot = makeSlot(i, cardDistance, verticalDistance, refs.length);
        // All cards 100% opacity
        const opacity = 1;
        tl.set(el, { zIndex: slot.zIndex }, 'promote');
        tl.to(
          el,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            opacity: opacity,
            duration: config.durMove,
            ease: config.ease
          },
          `promote+=${i * 0.15}`
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      const backOpacity = 1; // Keep full opacity
      // Start return immediately after drop completes, no pause
      tl.addLabel('return', `${config.durDrop}`);
      tl.call(
        () => {
          gsap.set(elFront, { zIndex: backSlot.zIndex });
        },
        undefined,
        'return'
      );
      tl.to(
        elFront,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          opacity: backOpacity,
          duration: config.durReturn,
          ease: config.ease
        },
        'return'
      );

      tl.call(() => {
        order.current = [...rest, front];
      });
    };

    // Pause animations during scroll for smooth scrolling
    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        isPaused = true;
        tlRef.current?.pause();
      }

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        isScrolling = false;
        isPaused = false;
        tlRef.current?.play();
      }, 150);
    };

    // Use IntersectionObserver to only run when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPaused) {
            tlRef.current?.play();
          } else {
            tlRef.current?.pause();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (container.current) {
      observer.observe(container.current);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    swap();
    intervalRef.current = window.setInterval(swap, delay);

    if (pauseOnHover) {
      const node = container.current;
      if (!node) return;

      const pause = () => {
        isPaused = true;
        tlRef.current?.pause();
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
      const resume = () => {
        isPaused = false;
        tlRef.current?.play();
        intervalRef.current = window.setInterval(swap, delay);
      };
      node.addEventListener('mouseenter', pause);
      node.addEventListener('mouseleave', resume);
      return () => {
        node.removeEventListener('mouseenter', pause);
        node.removeEventListener('mouseleave', resume);
        window.removeEventListener('scroll', handleScroll);
        observer.disconnect();
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (scrollTimeout) clearTimeout(scrollTimeout);
      };
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing, config, refs]);

  const rendered = childArr.map((child, i) =>
    isValidElement(child)
      ? cloneElement(child as React.ReactElement<any>, {
          key: i,
          ref: refs[i],
          style: { width, height, ...((child.props as any).style ?? {}) },
          onClick: (e: React.MouseEvent) => {
            (child.props as any).onClick?.(e);
            onCardClick?.(i);
          }
        })
      : child
  );

  return (
    <div ref={container} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
};

export default CardSwap;
