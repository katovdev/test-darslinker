"use client";

import { useMemo } from "react";
import Link from "next/link";

// Pre-computed dot positions to avoid Math.random during render
const DOT_POSITIONS = Array.from({ length: 20 }).map((_, i) => ({
  left: ((i * 37 + 13) % 100),
  top: ((i * 53 + 7) % 100),
  delay: (i * 0.25) % 5,
  duration: 3 + (i * 0.2) % 4,
}));

function NeonDots() {
  const dots = useMemo(() => DOT_POSITIONS, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {dots.map((dot, i) => (
        <div
          key={i}
          className="neon-dot absolute h-1 w-1 rounded-full opacity-60"
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`,
          }}
        />
      ))}
      <style jsx>{`
        .neon-dot {
          background: #7ea2d4;
          box-shadow:
            0 0 6px #7ea2d4,
            0 0 12px #7ea2d4;
          animation: float ease-in-out infinite;
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}

function Logo() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-1">
      <span className="text-3xl font-bold text-white">dars</span>
      <span className="text-3xl font-bold text-[#7EA2D4]">linker</span>
    </Link>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#232323]">
      <NeonDots />
      <div className="z-10 w-full max-w-md px-4">
        <Logo />
        {children}
      </div>
    </div>
  );
}
