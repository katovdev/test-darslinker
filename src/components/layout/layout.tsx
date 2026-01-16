"use client";

import { Header } from "./header";
import { Footer } from "./footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function Layout({
  children,
  className,
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {showHeader && <Header />}
      <main className={cn("flex-1", className)}>{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
