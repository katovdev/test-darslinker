"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useIsAuthenticated, useHasHydrated, useUser } from "@/store";

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
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const hasHydrated = useHasHydrated();
  const user = useUser();

  useEffect(() => {
    // Only redirect after hydration is complete
    if (hasHydrated && isAuthenticated && user) {
      // Redirect based on user role
      switch (user.role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "teacher":
          router.push("/teacher/dashboard");
          break;
        default:
          router.push("/student/dashboard");
      }
    }
  }, [isAuthenticated, hasHydrated, user, router]);

  // Show loading while hydrating or if authenticated (about to redirect)
  if (!hasHydrated || (isAuthenticated && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

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
