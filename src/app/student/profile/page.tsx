"use client";

import { useEffect, useState } from "react";
import { User, Phone, Loader2, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslations } from "@/hooks/use-locale";
import { useUser, useAppStore } from "@/store";
import { studentAPI, type StudentProfile } from "@/lib/api";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const t = useTranslations();
  const user = useUser();
  const setUser = useAppStore((state) => state.setUser);

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await studentAPI.getProfile();
      if (response.success && response.data) {
        setProfile(response.data);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      toast.error(t("common.fillRequiredFields"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await studentAPI.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
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
      setIsSaving(false);
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
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="space-y-6 pt-6">
            <div className="flex justify-center">
              <Skeleton className="h-24 w-24 rounded-full bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
            <Skeleton className="h-10 w-full bg-gray-700" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="mx-auto max-w-2xl">
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
              onClick={loadProfile}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("profile.editProfile")}
        </h1>
        <p className="mt-1 text-gray-400">{t("profile.updateInfo")}</p>
      </div>

      {/* Profile Card */}
      <Card className="border-gray-800 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-white">{t("sidebar.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <Avatar className="h-24 w-24 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
              {profile?.avatarUrl && <AvatarImage src={profile.avatarUrl} />}
              <AvatarFallback className="bg-transparent text-2xl font-medium text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-300">
                  {t("profile.firstName")}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder={t("profile.firstName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-300">
                  {t("profile.lastName")}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder={t("profile.lastName")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-300">
                {t("profile.phone")}
              </Label>
              <div className="relative">
                <Phone className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="phone"
                  value={profile?.phone || ""}
                  disabled
                  className="border-gray-700 bg-gray-800/50 pl-10 text-gray-400"
                />
              </div>
              <p className="text-xs text-gray-500">
                Phone number cannot be changed
              </p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("profile.saveChanges")}
          </Button>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="border-gray-800 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-white">{t("sidebar.account")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4">
            <div>
              <p className="text-sm text-gray-400">Member since</p>
              <p className="font-medium text-white">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
