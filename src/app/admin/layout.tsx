"use client";

import { Loader2 } from "lucide-react";
import { useRequireAdmin } from "@/hooks/use-session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, user } = useRequireAdmin();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-64">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
