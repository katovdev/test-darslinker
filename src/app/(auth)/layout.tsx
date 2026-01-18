"use client";

import Link from "next/link";

function Logo() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-1">
      <span className="text-2xl font-semibold text-foreground">dars</span>
      <span className="text-2xl font-semibold text-link">linker</span>
    </Link>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="w-full max-w-[360px] px-4">
        <Logo />
        {children}
      </div>
    </div>
  );
}
