"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, LogOut, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/context/auth-context";
import { logout } from "@/services/auth";
import { DashboardSidebar } from "./sidebar";

export function DashboardHeader() {
  const t = useTranslations();
  const router = useRouter();
  const user = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-foreground">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-border bg-background p-0"
            >
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 px-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl font-bold text-foreground">dars</span>
                  <span className="text-2xl font-bold text-[#7EA2D4]">
                    linker
                  </span>
                </Link>
              </div>
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-foreground">dars</span>
            <span className="text-2xl font-bold text-[#7EA2D4]">linker</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 text-muted-foreground hover:text-foreground sm:flex"
            asChild
          >
            <a
              href="https://t.me/Darslinker_cbot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Bot className="h-4 w-4" />
              {t("header.telegramBot")}
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2 pr-3 pl-2"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                  <AvatarFallback className="bg-transparent text-sm font-medium text-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground md:block">
                  {user?.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-border bg-secondary"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="cursor-pointer text-foreground hover:bg-secondary focus:bg-secondary"
                >
                  {t("sidebar.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="cursor-pointer text-foreground hover:bg-secondary focus:bg-secondary"
                >
                  {t("sidebar.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-secondary" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-400 hover:bg-secondary hover:text-red-400 focus:bg-secondary focus:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? t("dashboard.loggingOut") : t("header.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
