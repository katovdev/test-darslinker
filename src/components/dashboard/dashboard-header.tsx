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
import { useUser, useAppStore } from "@/store";
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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-64 border-gray-800 bg-gray-900 p-0"
            >
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 px-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="text-2xl font-bold text-white">dars</span>
                  <span className="text-2xl font-bold text-[#7EA2D4]">
                    linker
                  </span>
                </Link>
              </div>
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-1">
            <span className="text-2xl font-bold text-white">dars</span>
            <span className="text-2xl font-bold text-[#7EA2D4]">linker</span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Telegram Bot */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-2 text-gray-400 hover:text-white sm:flex"
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

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative flex items-center gap-2 pl-2 pr-3"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                  <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-white md:block">
                  {user?.firstName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 border-gray-700 bg-gray-800"
            >
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/profile"
                  className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  {t("sidebar.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/settings"
                  className="cursor-pointer text-white hover:bg-gray-700 focus:bg-gray-700"
                >
                  {t("sidebar.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer text-red-400 hover:bg-gray-700 hover:text-red-400 focus:bg-gray-700 focus:text-red-400"
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
