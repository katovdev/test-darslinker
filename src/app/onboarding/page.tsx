"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  GraduationCap,
  Globe,
  Instagram,
  Youtube,
  Send,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsAuthenticated, useUser } from "@/store";
import { useTranslations } from "@/hooks/use-locale";
import { onboardingAPI, type OnboardingStatus } from "@/lib/api";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // If already a teacher, redirect
    if (user?.role === "teacher") {
      router.push("/teacher/dashboard");
      return;
    }

    loadStatus();
  }, [isAuthenticated, user, router]);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const response = await onboardingAPI.getStatus();
      if (response.success) {
        setStatus(response.data);
        // Pre-fill form if there's existing data
        if (response.data.requestData) {
          setUsername(response.data.requestData.username || "");
          setBusinessName(response.data.requestData.businessName || "");
          setBio(response.data.requestData.bio || "");
          setWebsite(response.data.requestData.socialLinks?.website || "");
          setTelegram(response.data.requestData.socialLinks?.telegram || "");
          setInstagram(response.data.requestData.socialLinks?.instagram || "");
          setYoutube(response.data.requestData.socialLinks?.youtube || "");
        }
      }
    } catch (error) {
      console.error("Failed to load status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!username.trim()) {
      toast.error(t("onboarding.usernameRequired"));
      return;
    }

    // Username validation (lowercase, alphanumeric, hyphens only)
    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      toast.error(t("onboarding.usernameInvalid"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onboardingAPI.requestTeacher({
        username,
        businessName: businessName || undefined,
        bio: bio || undefined,
        socialLinks: {
          website: website || undefined,
          telegram: telegram || undefined,
          instagram: instagram || undefined,
          youtube: youtube || undefined,
        },
      });

      if (response.success) {
        toast.success(t("onboarding.requestSubmitted"));
        loadStatus();
      }
    } catch (error) {
      console.error("Failed to submit request:", error);
      toast.error(t("errors.generalError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await onboardingAPI.completeOnboarding();
      if (response.success) {
        toast.success(t("onboarding.setupComplete"));
        // Redirect to teacher dashboard
        router.push("/teacher/dashboard");
      }
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      toast.error(t("errors.generalError"));
    } finally {
      setIsCompleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-[#7EA2D4]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("common.back")}
          </Link>
          <span className="text-xl font-bold text-[#7EA2D4]">Darslinker</span>
          <div className="w-20" />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Status: None - Show application form */}
        {status?.status === "none" && (
          <div className="space-y-6">
            {/* Hero */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#7EA2D4]/10">
                <GraduationCap className="h-8 w-8 text-[#7EA2D4]" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                {t("onboarding.title")}
              </h1>
              <p className="mt-2 text-gray-400">{t("onboarding.subtitle")}</p>
            </div>

            {/* Form */}
            <Card className="border-gray-800 bg-gray-800/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {t("onboarding.applicationForm")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Username */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    {t("onboarding.username")} *
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value.toLowerCase())
                      }
                      placeholder="yourname"
                      className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                    />
                    <span className="text-sm whitespace-nowrap text-gray-400">
                      .darslinker.uz
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("onboarding.usernameHelp")}
                  </p>
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <Label className="text-gray-300">
                    {t("onboarding.businessName")}
                  </Label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder={t("onboarding.businessNamePlaceholder")}
                    className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label className="text-gray-300">{t("onboarding.bio")}</Label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("onboarding.bioPlaceholder")}
                    rows={4}
                    className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                  />
                </div>

                {/* Social Links */}
                <div className="space-y-4">
                  <Label className="text-gray-300">
                    {t("onboarding.socialLinks")}
                  </Label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Website */}
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yoursite.com"
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Telegram */}
                    <div className="flex items-center gap-2">
                      <Send className="h-5 w-5 text-gray-500" />
                      <Input
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="@username"
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* Instagram */}
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-gray-500" />
                      <Input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@username"
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                      />
                    </div>

                    {/* YouTube */}
                    <div className="flex items-center gap-2">
                      <Youtube className="h-5 w-5 text-gray-500" />
                      <Input
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        placeholder="channel-url"
                        className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#7EA2D4] hover:bg-[#6B8FC1]"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  {t("onboarding.submitApplication")}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status: Pending */}
        {status?.status === "pending" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t("onboarding.pendingTitle")}
            </h1>
            <p className="mt-2 max-w-md text-gray-400">
              {t("onboarding.pendingDescription")}
            </p>
            <p className="mt-4 text-sm text-gray-500">
              {t("onboarding.requestedAt")}:{" "}
              {status.requestedAt
                ? new Date(status.requestedAt).toLocaleDateString()
                : "-"}
            </p>

            {/* Show submitted data */}
            {status.requestData && (
              <Card className="mt-8 w-full max-w-md border-gray-800 bg-gray-800/30 text-left">
                <CardContent className="space-y-2 p-4">
                  <div>
                    <span className="text-sm text-gray-500">
                      {t("onboarding.username")}:
                    </span>
                    <p className="text-white">{status.requestData.username}</p>
                  </div>
                  {status.requestData.businessName && (
                    <div>
                      <span className="text-sm text-gray-500">
                        {t("onboarding.businessName")}:
                      </span>
                      <p className="text-white">
                        {status.requestData.businessName}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Button
              onClick={loadStatus}
              variant="outline"
              className="mt-6 gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("onboarding.checkStatus")}
            </Button>
          </div>
        )}

        {/* Status: Approved */}
        {status?.status === "approved" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t("onboarding.approvedTitle")}
            </h1>
            <p className="mt-2 max-w-md text-gray-400">
              {t("onboarding.approvedDescription")}
            </p>

            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="mt-6 bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4" />
              )}
              {t("onboarding.completeSetup")}
            </Button>
          </div>
        )}

        {/* Status: Rejected */}
        {status?.status === "rejected" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t("onboarding.rejectedTitle")}
            </h1>
            <p className="mt-2 max-w-md text-gray-400">
              {t("onboarding.rejectedDescription")}
            </p>

            {status.rejectionReason && (
              <Card className="mt-6 w-full max-w-md border-red-900/50 bg-red-900/10">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500">
                    {t("onboarding.rejectionReason")}:
                  </p>
                  <p className="mt-1 text-red-400">{status.rejectionReason}</p>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={() => {
                setStatus({ ...status, status: "none" });
              }}
              variant="outline"
              className="mt-6 gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              {t("onboarding.tryAgain")}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
