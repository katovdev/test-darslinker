"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, hasHydrated, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    switch (user.role) {
      case "teacher":
        router.replace("/teacher");
        break;
      case "admin":
        router.replace("/admin");
        break;
      case "moderator":
        router.replace("/moderator");
        break;
      case "student":
      default:
        router.replace("/me");
        break;
    }
  }, [user, isLoading, hasHydrated, isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
    </div>
  );
}
