"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useTranslations } from "@/hooks/use-locale";
import { CollapsibleSidebar } from "@/components/dashboard/collapsible-sidebar";
import {
  getDashboardNavigation,
  getRoleTheme,
  getRoleTitle,
} from "@/components/dashboard/dashboard-navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, hasHydrated, isAuthenticated } = useAuth();
  const t = useTranslations();

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  // Show loading while checking authentication
  if (isLoading || !hasHydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-emerald-500" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-emerald-500" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  const navItems = getDashboardNavigation(user, t);
  const theme = getRoleTheme(user.role);
  const title = getRoleTitle(user.role, t);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleSidebar
        navItems={navItems}
        title={title}
        subtitle={user.firstName + " " + user.lastName}
        logoText="DL"
        theme={theme}
        basePath="/dashboard"
      />
      <main className="transition-all duration-300 ease-in-out lg:ml-64">
        <div className="min-h-screen p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
