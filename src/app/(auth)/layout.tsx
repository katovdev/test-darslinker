"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

function Logo() {
  return (
    <Link href="/" className="mb-8 flex items-center justify-center gap-1">
      <span className="text-2xl font-semibold text-foreground">dars</span>
      <span className="bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] bg-clip-text text-2xl font-semibold text-transparent">
        linker
      </span>
    </Link>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user } = useAuth();

  useEffect(() => {
    if (hasHydrated && isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  if (!hasHydrated || (isAuthenticated && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
      </div>

      <div className="w-full max-w-[360px] px-4">
        <Logo />
        {children}
      </div>
    </div>
  );
}
