"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, User, BookOpen, CreditCard, Settings } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { useTranslations } from "@/hooks/use-locale";
import { HomeHeader } from "@/components/home/home-header";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/me", label: "profile", icon: User, exact: true },
  { href: "/me/courses", label: "myCourses", icon: BookOpen },
  { href: "/me/payments", label: "payments", icon: CreditCard },
];

export default function MeLayout({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useSession({ required: true });
  const pathname = usePathname();
  const t = useTranslations();

  if (isLoading) {
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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
          <p className="mt-4 text-sm text-gray-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />
      <main className="pt-16">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          {/* Navigation tabs */}
          <nav className="mb-6 flex gap-1 overflow-x-auto rounded-lg border border-gray-800 bg-gray-800/30 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(`sidebar.${item.label}`) || item.label}
                </Link>
              );
            })}
          </nav>

          {children}
        </div>
      </main>
    </div>
  );
}
