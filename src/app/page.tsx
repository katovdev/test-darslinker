"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import {
  HomeHeader,
  Hero,
  Features,
  ArticlesSection,
  ContactForm,
  HomeFooter,
} from "@/components/home";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to hydrate
    if (!hasHydrated) return;

    // Redirect authenticated users to dashboard
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, hasHydrated, router]);

  // Show loading while checking authentication
  if (!hasHydrated || isLoading) {
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

  // Show loading while redirecting authenticated users
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Show public home page only for unauthenticated users
  return (
    <div className="min-h-screen bg-background">
      <HomeHeader />
      <main>
        <Hero />
        <Features />
        <ArticlesSection />
        <ContactForm />
      </main>
      <HomeFooter />
    </div>
  );
}
