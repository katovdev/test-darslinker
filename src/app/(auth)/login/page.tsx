"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-locale";
import authService, {
  formatPhoneNumber,
  validators,
} from "@/services/auth";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validators.phone(phone);
    if (error) {
      setPhoneError(t(`auth.${error}`));
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.requestOtp(phone);

      if (response.success) {
        setOtpSent(true);
        setStep("otp");
        toast.success(t("auth.otpSent"));
      } else {
        toast.error(response.message || t("errors.generalError"));
      }
    } catch (error) {
      toast.error(t("errors.generalError"));
      console.error("Request OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
        setOtpError(response.message || t("auth.otpVerificationFailed"));
      }
    } catch (error) {
      setOtpError(t("auth.otpVerificationFailed"));
      console.error("OTP verification error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);

    try {
      const response = await authService.requestOtp(phone);

      if (response.success) {
        toast.success(t("auth.otpResent"));
      } else {
        toast.error(response.message || t("errors.generalError"));
      }
    } catch (error) {
      toast.error(t("errors.generalError"));
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
    setOtpError(null);
    setOtpSent(false);
  };

  const openTelegramBot = () => {
    authService.openTelegramBot();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h1 className="mb-1 text-center text-xl font-semibold">
          {t("auth.login")}
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {step === "phone" ? t("auth.enterPhone") : t("auth.enterOtp")}
        </p>

        {step === "phone" ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("auth.phone")}</Label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-3">
                  <span className="text-base">🇺🇿</span>
                  <span className="text-sm text-muted-foreground">+998</span>
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="XX XXX XX XX"
                  className="pl-[5.5rem]"
                  autoComplete="tel"
                  autoFocus
                />
              </div>
              {phoneError && (
                <p className="text-sm text-destructive">{phoneError}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.sendOtp")}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Success message */}
            <div className="rounded-md bg-success/10 p-3 text-center">
              <p className="text-sm text-success">{t("auth.otpSentToTelegram")}</p>
            </div>

            {/* Telegram bot button */}
            <Button
              type="button"
              onClick={openTelegramBot}
              className="w-full bg-[#0088cc] text-white hover:bg-[#0077b3]"
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
              </svg>
              {t("auth.openTelegram")}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {t("auth.alreadyHaveCode")}
                </span>
              </div>
            </div>

            {/* OTP form */}
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder={t("auth.otpPlaceholder")}
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
                {otpError && (
                  <p className="text-center text-sm text-destructive">
                    {otpError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? t("auth.verifying") : t("auth.verifyOtp")}
              </Button>
            </form>

            {/* Back and resend buttons */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleBackToPhone}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("auth.changePhone")}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isLoading}
                className="text-link hover:underline disabled:opacity-50"
              >
                {t("auth.resendOtp")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/register" className="font-medium text-link hover:underline">
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
