"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { ThemeCustomizer } from "@/components/admin/theme-customizer";

export default function DashboardThemePage() {
  const router = useRouter();
  const { user, isLoading, hasHydrated } = useAuth();

  // Wait for authentication to load
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  // Authorization check - Admin only
  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-white">Access Denied</h2>
          <p className="mt-2 text-gray-400">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <ThemeCustomizer />;
}
