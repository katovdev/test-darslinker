"use client";

import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-1">
      <span className="text-2xl font-semibold text-white">dars</span>
      <span className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">linker</span>
    </Link>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-[360px] px-4">
        <Logo />
        {children}
      </div>
    </div>
  );
}
