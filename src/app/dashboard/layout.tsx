"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardHeader, DashboardSidebar } from "@/components/dashboard";
import { useIsAuthenticated } from "@/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600 border-t-[#7EA2D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <DashboardHeader />
      <DashboardSidebar />
      <main className="pt-16 lg:pl-64">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
