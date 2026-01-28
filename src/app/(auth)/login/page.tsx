"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import authService, { formatPhoneNumber, validators } from "@/services/auth";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations();
  const { setUser } = useAuth();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setStep("otp");
        toast.success(t("auth.otpSent"));
      } else {
        const errorCode = response.error?.code;
        const errorMessage =
          errorCode && t(`errors.${errorCode}`) !== `errors.${errorCode}`
            ? t(`errors.${errorCode}`)
            : response.error?.message || t("errors.generalError");
        toast.error(errorMessage);
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

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        toast.success(
          t("auth.welcomeBack", { name: response.data.user.firstName })
        );
        router.push("/dashboard");
      } else if (!response.success) {
        const errorCode = response.error?.code;
        const errorMessage =
          errorCode && t(`errors.${errorCode}`) !== `errors.${errorCode}`
            ? t(`errors.${errorCode}`)
            : response.error?.message || t("auth.otpVerificationFailed");
        setOtpError(errorMessage);
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
        const errorCode = response.error?.code;
        const errorMessage =
          errorCode && t(`errors.${errorCode}`) !== `errors.${errorCode}`
            ? t(`errors.${errorCode}`)
            : response.error?.message || t("errors.generalError");
        toast.error(errorMessage);
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
  };

  const openTelegramBot = () => {
    authService.openTelegramBot();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <h1 className="mb-1 text-center text-xl font-semibold text-foreground">
        {t("auth.login")}
      </h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        {step === "phone" ? t("auth.enterPhone") : t("auth.enterOtp")}
      </p>

      {step === "phone" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-foreground"
            >
              {t("auth.phone")}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 pl-3">
                <span className="text-base">🇺🇿</span>
                <span className="text-sm text-muted-foreground">+998</span>
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="XX XXX XX XX"
                className="w-full rounded-xl border border-input bg-background py-3 pr-4 pl-[5.5rem] text-foreground placeholder-muted-foreground transition-colors outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoComplete="tel"
                autoFocus
              />
            </div>
            {phoneError && <p className="text-sm text-red-400">{phoneError}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] py-3 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30 disabled:opacity-50"
          >
            {isLoading ? t("common.loading") : t("auth.sendOtp")}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3 text-center">
            <p className="text-sm text-green-500">
              {t("auth.otpSentToTelegram")}
            </p>
          </div>

          <button
            type="button"
            onClick={openTelegramBot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0088cc] py-3 font-semibold text-white transition-colors hover:bg-[#0077b3]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.44-.751-.245-1.349-.374-1.297-.789.027-.216.324-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.12.098.153.228.166.331.014.103.03.336.017.519z" />
            </svg>
            {t("auth.openTelegram")}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                {t("auth.alreadyHaveCode")}
              </span>
            </div>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={otp}
                onChange={handleOtpChange}
                placeholder={t("auth.otpPlaceholder")}
                className="w-full rounded-xl border border-input bg-background py-3 text-center text-lg tracking-widest text-foreground placeholder-muted-foreground transition-colors outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />
              {otpError && (
                <p className="text-center text-sm text-red-400">{otpError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full rounded-xl bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] py-3 font-semibold text-white shadow-lg shadow-[#7ea2d4]/25 transition-all hover:shadow-xl hover:shadow-[#7ea2d4]/30 disabled:opacity-50"
            >
              {isLoading ? t("auth.verifying") : t("auth.verifyOtp")}
            </button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleBackToPhone}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("auth.changePhone")}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
            >
              {t("auth.resendOtp")}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.noAccount")}{" "}
          <button
            type="button"
            onClick={openTelegramBot}
            className="font-medium text-primary transition-colors hover:text-primary/80"
          >
            {t("auth.signUpViaTelegram")}
          </button>
        </p>
      </div>
    </div>
  );
}
