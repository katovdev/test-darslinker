"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTranslations } from "@/hooks/use-locale";
import authService, {
  formatPhoneNumber,
  getPhoneDigits,
  validators,
  TELEGRAM_BOTS,
} from "@/services/auth";

interface TempUserData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [tempUserData, setTempUserData] = useState<TempUserData | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setPhoneError(null);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setOtpError(null);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validators.phone(phone);
    if (error) {
      setPhoneError(t(`auth.${error}`));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.checkUser(phone);

      if (response.exists && response.next === "login") {
        // User exists and is verified - go to password page
        sessionStorage.setItem("tempUserData", JSON.stringify(response.user));
        sessionStorage.setItem(
          "userIdentifier",
          `+998${getPhoneDigits(phone)}`
        );
        router.push("/password");
      } else if (response.exists && response.next === "verify") {
        // User exists but needs OTP verification
        setTempUserData(response.user || null);
        setShowOtpModal(true);
      } else {
        // New user - redirect to register
        sessionStorage.setItem(
          "registerIdentifier",
          `+998${getPhoneDigits(phone)}`
        );
        sessionStorage.setItem("registerMode", "phone");
        router.push("/register");
      }
    } catch (error) {
      toast.error(t("errors.generalError"));
      console.error("Check user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validators.otp(otp);
    if (error) {
      setOtpError(t(`auth.${error}`));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyOtp(phone, otp);

      if (response.success) {
        toast.success(t("auth.welcomeBack"));
        router.push("/dashboard");
      } else {
        setOtpError(t("auth.otpVerificationFailed"));
      }
    } catch (error) {
      setOtpError(t("auth.otpVerificationFailed"));
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openTelegramBot = () => {
    window.open(`https://t.me/${TELEGRAM_BOTS.login}`, "_blank");
  };

  return (
    <>
      <Card className="border-0 bg-white/5 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          <h1 className="mb-2 text-center text-2xl font-bold text-white">
            {t("auth.login")}
          </h1>
          <p className="mb-6 text-center text-sm text-gray-400">
            {t("auth.enterPhone")}
          </p>

          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                {t("auth.phone")}
              </Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-4">
                  <span className="text-lg">🇺🇿</span>
                  <span className="text-sm text-gray-400">+998</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="XX XXX XX XX"
                  className="border-gray-600 bg-gray-800/50 pl-24 text-white placeholder:text-gray-500"
                  autoComplete="tel"
                  autoFocus
                />
              </div>
              {phoneError && (
                <p className="text-sm text-red-400">{phoneError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? t("common.loading") : t("auth.continue")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t("auth.noAccount")}{" "}
              <Link
                href="/register"
                className="font-medium text-[#7EA2D4] hover:underline"
              >
                {t("auth.signUp")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="border-gray-700 bg-[#2a2a2a] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("auth.otpTitle")}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {t("auth.otpDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <Button
              type="button"
              onClick={openTelegramBot}
              className="w-full bg-[#0088cc] text-white hover:bg-[#0077b3]"
            >
              <svg
                className="mr-2 h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
              </svg>
              {t("auth.goToTelegram")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#2a2a2a] px-2 text-gray-400">
                  {t("auth.alreadyHaveCode")}
                </span>
              </div>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder={t("auth.otpPlaceholder")}
                  className="border-gray-600 bg-gray-800/50 text-center text-xl tracking-widest text-white placeholder:text-gray-500"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {otpError && (
                  <p className="text-center text-sm text-red-400">{otpError}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? t("auth.verifying") : t("auth.verifyOtp")}
              </Button>
            </form>

            {tempUserData && (
              <p className="text-center text-sm text-gray-400">
                {tempUserData.firstName} {tempUserData.lastName}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
