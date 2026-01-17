"use client";

import { useEffect, useState } from "react";
import {
  User,
  Palette,
  Globe,
  Save,
  Loader2,
  RefreshCw,
  Link2,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "@/hooks/use-locale";
import { useUser, useAppStore } from "@/store";
import {
  teacherAPI,
  type TeacherOwnProfile,
  type TeacherBranding,
} from "@/lib/api";
import { toast } from "sonner";

export default function TeacherSettingsPage() {
  const t = useTranslations();
  const user = useUser();
  const setUser = useAppStore((state) => state.setUser);

  const [profile, setProfile] = useState<TeacherOwnProfile | null>(null);
  const [branding, setBranding] = useState<TeacherBranding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [telegram, setTelegram] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [website, setWebsite] = useState("");

  // Branding form state
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7EA2D4");
  const [secondaryColor, setSecondaryColor] = useState("#5A85C7");

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [profileResponse, brandingResponse] = await Promise.all([
        teacherAPI.getProfile(),
        teacherAPI.getBranding(),
      ]);

      if (profileResponse.success && profileResponse.data) {
        const data = profileResponse.data;
        setProfile(data);
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setBusinessName(data.businessName || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatarUrl || "");
        setTelegram(data.socialLinks?.telegram || "");
        setInstagram(data.socialLinks?.instagram || "");
        setYoutube(data.socialLinks?.youtube || "");
        setWebsite(data.socialLinks?.website || "");
      }

      if (brandingResponse.success && brandingResponse.data) {
        const data = brandingResponse.data;
        setBranding(data);
        setLogoUrl(data.logoUrl || "");
        setPrimaryColor(data.primaryColor || "#7EA2D4");
        setSecondaryColor(data.secondaryColor || "#5A85C7");
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    setIsSavingProfile(true);

    try {
      const response = await teacherAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        businessName: businessName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        socialLinks: {
          telegram: telegram.trim() || undefined,
          instagram: instagram.trim() || undefined,
          youtube: youtube.trim() || undefined,
          website: website.trim() || undefined,
        },
      });

      if (response.success && response.data) {
        setProfile(response.data);
        // Update user in store
        if (user) {
          setUser({
            ...user,
            firstName: response.data.firstName,
            lastName: response.data.lastName,
          });
        }
        toast.success(t("profile.updated"));
      }
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to update profile:", err);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);

    try {
      const response = await teacherAPI.updateBranding({
        logoUrl: logoUrl.trim() || undefined,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
      });

      if (response.success && response.data) {
        setBranding(response.data);
        toast.success(t("teacher.brandingUpdated"));
      }
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to update branding:", err);
    } finally {
      setIsSavingBranding(false);
    }
  };

  const getInitials = () => {
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32 bg-gray-700" />
        <Skeleton className="h-12 w-full bg-gray-700" />
        <Skeleton className="h-96 w-full bg-gray-700" />
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <User className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("teacher.settings")}
        </h1>
        <p className="mt-1 text-gray-400">{t("teacher.settingsDesc")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gray-700"
          >
            <User className="mr-2 h-4 w-4" />
            {t("teacher.profile")}
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="data-[state=active]:bg-gray-700"
          >
            <Palette className="mr-2 h-4 w-4" />
            {t("teacher.branding")}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.profileInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                  {avatarUrl && <AvatarImage src={avatarUrl} />}
                  <AvatarFallback className="bg-transparent text-2xl font-medium text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatarUrl" className="text-gray-300">
                    {t("teacher.avatarUrl")}
                  </Label>
                  <Input
                    id="avatarUrl"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">
                    {t("profile.firstName")} *
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">
                    {t("profile.lastName")} *
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="border-gray-700 bg-gray-800 text-white"
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-gray-300">
                  {t("teacher.businessName")}
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={t("teacher.businessNamePlaceholder")}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">
                  {t("teacher.bio")}
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("teacher.bioPlaceholder")}
                  className="min-h-24 border-gray-700 bg-gray-800 text-white"
                />
              </div>

              {/* Phone (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">
                  {t("profile.phone")}
                </Label>
                <Input
                  id="phone"
                  value={profile?.phone || ""}
                  disabled
                  className="border-gray-700 bg-gray-800/50 text-gray-400"
                />
                <p className="text-xs text-gray-500">
                  {t("teacher.phoneReadOnly")}
                </p>
              </div>

              {/* Username (read-only) */}
              {profile?.username && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    {t("teacher.username")}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="username"
                      value={profile.username}
                      disabled
                      className="border-gray-700 bg-gray-800/50 text-gray-400"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-gray-700 text-gray-400 hover:bg-gray-800"
                      asChild
                    >
                      <a
                        href={`https://${profile.username}.darslinker.uz`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {t("teacher.yourSubdomain")}: {profile.username}
                    .darslinker.uz
                  </p>
                </div>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("profile.saveChanges")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.socialLinks")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="telegram"
                  className="flex items-center gap-2 text-gray-300"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Telegram
                </Label>
                <Input
                  id="telegram"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@username"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="instagram"
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="youtube"
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="https://youtube.com/@channel"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="website"
                  className="flex items-center gap-2 text-gray-300"
                >
                  <Link2 className="h-4 w-4" />
                  {t("teacher.website")}
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.brandingSettings")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-gray-300">
                  {t("teacher.logoUrl")}
                </Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="border-gray-700 bg-gray-800 text-white"
                />
                {logoUrl && (
                  <div className="mt-2 rounded-lg bg-gray-800/50 p-4">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="h-12 w-auto"
                    />
                  </div>
                )}
              </div>

              {/* Colors */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-gray-300">
                    {t("teacher.primaryColor")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer border-gray-700 bg-gray-800 p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="border-gray-700 bg-gray-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-gray-300">
                    {t("teacher.secondaryColor")}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer border-gray-700 bg-gray-800 p-1"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="border-gray-700 bg-gray-800 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label className="text-gray-300">{t("teacher.preview")}</Label>
                <div
                  className="rounded-lg p-6"
                  style={{ backgroundColor: primaryColor + "10" }}
                >
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
                    ) : (
                      <div
                        className="h-8 w-8 rounded"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}
                    <span
                      className="text-lg font-bold"
                      style={{ color: primaryColor }}
                    >
                      {businessName || "Your Business"}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t("teacher.primaryButton")}
                    </button>
                    <button
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      {t("teacher.secondaryButton")}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSaveBranding}
                disabled={isSavingBranding}
                className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                {isSavingBranding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t("teacher.saveBranding")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
