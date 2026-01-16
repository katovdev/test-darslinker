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

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations();

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);

  // Pre-populate phone from login flow
  useEffect(() => {
    const registerIdentifier = sessionStorage.getItem("registerIdentifier");
    if (registerIdentifier) {
      // Remove +998 prefix and format
      const digits = registerIdentifier.replace(/^\+998/, "");
      setFormData((prev) => ({
        ...prev,
        phone: formatPhoneNumber(digits),
      }));
      sessionStorage.removeItem("registerIdentifier");
      sessionStorage.removeItem("registerMode");
    }
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    if (field === "phone") {
      value = formatPhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setOtpError(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const firstNameError = validators.firstName(formData.firstName);
    if (firstNameError) {
      newErrors.firstName = t(`auth.${firstNameError}`);
    }

    const lastNameError = validators.lastName(formData.lastName);
    if (lastNameError) {
      newErrors.lastName = t(`auth.${lastNameError}`);
    }

    const phoneError = validators.phone(formData.phone);
    if (phoneError) {
      newErrors.phone = t(`auth.${phoneError}`);
    }

    const passwordError = validators.password(formData.password);
    if (passwordError) {
      newErrors.password = t(`auth.${passwordError}`);
    }

    const confirmPasswordError = validators.confirmPassword(
      formData.password,
      formData.confirmPassword
    );
    if (confirmPasswordError) {
      newErrors.confirmPassword = t(`auth.${confirmPasswordError}`);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Check if user already exists
      const checkResponse = await authService.checkUser(formData.phone);

      if (checkResponse.exists) {
        toast.error(t("auth.userAlreadyExists"));
        setIsLoading(false);
        return;
      }

      // Register user
      const response = await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        password: formData.password,
        role: "teacher",
      });

      if (response.success) {
        // Store identifier for OTP verification
        sessionStorage.setItem(
          "registrationIdentifier",
          `+998${getPhoneDigits(formData.phone)}`
        );
        setShowOtpModal(true);
      } else {
        toast.error(response.message || t("auth.registrationFailed"));
      }
    } catch (error) {
      toast.error(t("auth.registrationFailed"));
      console.error("Registration error:", error);
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
      const response = await authService.verifyOtp(formData.phone, otp);

      if (response.success) {
        toast.success(t("auth.welcomeBack"));
        sessionStorage.removeItem("registrationIdentifier");
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
    window.open(`https://t.me/${TELEGRAM_BOTS.register}`, "_blank");
  };

  return (
    <>
      <Card className="border-0 bg-white/5 shadow-xl backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="mb-6 flex items-center">
            <Link
              href="/login"
              className="mr-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white">
              {t("auth.register")}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300">
                {t("auth.firstName")}
              </Label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-500"
                autoComplete="given-name"
                autoFocus
              />
              {errors.firstName && (
                <p className="text-sm text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300">
                {t("auth.lastName")}
              </Label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="border-gray-600 bg-gray-800/50 text-white placeholder:text-gray-500"
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Phone */}
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
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="XX XXX XX XX"
                  className="border-gray-600 bg-gray-800/50 pl-24 text-white placeholder:text-gray-500"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-400">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                {t("auth.password")}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="border-gray-600 bg-gray-800/50 pr-10 text-white placeholder:text-gray-500"
                  autoComplete="new-password"
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
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">
                {t("auth.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="border-gray-600 bg-gray-800/50 pr-10 text-white placeholder:text-gray-500"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#7EA2D4] to-[#5A85C7] text-white hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? t("auth.registering") : t("auth.createAccount")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              {t("auth.hasAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-[#7EA2D4] hover:underline"
              >
                {t("auth.signIn")}
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
