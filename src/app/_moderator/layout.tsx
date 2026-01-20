"use client";

import { Loader2 } from "lucide-react";
import { useRequireModerator } from "@/hooks/use-session";
import { ModeratorSidebar } from "@/components/moderator/moderator-sidebar";

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, user } = useRequireModerator();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-green-500" />
          </div>
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    !user ||
    !["admin", "moderator"].includes(user.role)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-green-500 to-teal-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-green-500" />
          </div>
          <p className="mt-4 text-sm text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <ModeratorSidebar />
      <main className="lg:ml-64">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
