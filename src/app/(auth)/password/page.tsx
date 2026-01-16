"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "@/hooks/use-locale";
import authService, { validators } from "@/services/auth";

interface TempUserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function PasswordPage() {
  const router = useRouter();
  const t = useTranslations();

  const [userData, setUserData] = useState<TempUserData | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user data from session storage
    const tempUserDataStr = sessionStorage.getItem("tempUserData");
    const identifier = sessionStorage.getItem("userIdentifier");

    if (!tempUserDataStr || !identifier) {
      // No user data, redirect to login
      router.push("/login");
      return;
    }

    try {
      const data = JSON.parse(tempUserDataStr) as TempUserData;
      setUserData(data);
      setUserIdentifier(identifier);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validators.passwordSimple(password);
    if (error) {
      setPasswordError(t(`auth.${error}`));
      return;
    }

    if (!userIdentifier) {
      router.push("/login");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(userIdentifier, password);

      if (response.success) {
        // Clear temp data
        sessionStorage.removeItem("tempUserData");
        sessionStorage.removeItem("userIdentifier");

        toast.success(t("auth.welcomeBack"));
        router.push("/dashboard");
      } else {
        setPasswordError(response.message || t("auth.invalidCredentials"));
      }
    } catch (error) {
      setPasswordError(t("auth.invalidCredentials"));
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  if (!userData) {
    return null; // or a loading spinner
  }

  return (
    <Card className="border-0 bg-white/5 shadow-xl backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="mb-6 flex items-center">
          <Link
            href="/login"
            onClick={() => {
              sessionStorage.removeItem("tempUserData");
              sessionStorage.removeItem("userIdentifier");
            }}
            className="mr-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {t("auth.welcomeBack")}
          </h1>
        </div>

        {/* User Info */}
        <div className="mb-8 flex flex-col items-center">
          <Avatar className="mb-4 h-20 w-20 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
            <AvatarFallback className="bg-transparent text-2xl font-bold text-white">
              {getInitials(userData.firstName, userData.lastName)}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-semibold text-white">
            {userData.firstName} {userData.lastName}
          </h2>
          <p className="text-sm text-gray-400">{userData.phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">
              {t("auth.password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder={t("auth.enterPassword")}
                className="border-gray-600 bg-gray-800/50 pr-10 text-white placeholder:text-gray-500"
                autoComplete="current-password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="text-sm text-red-400">{passwordError}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
            disabled={isLoading}
          >
            {isLoading ? t("auth.loggingIn") : t("auth.signIn")}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-[#7EA2D4] hover:underline"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
