"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Phone,
  Trophy,
  Star,
  BookOpen,
  Calendar,
  ArrowRight,
  Pencil,
  Camera,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { authApi } from "@/lib/api/auth";

export default function MePage() {
  const t = useTranslations();
  const { user, setUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    username: user?.username || "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "teacher":
        return t("admin.teacher");
      case "student":
        return t("admin.student");
      case "admin":
        return "Admin";
      case "moderator":
        return "Moderator";
      default:
        return "";
    }
  };

  const getStatusBadge = () => {
    switch (user?.status) {
      case "active":
        return (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
            {t("admin.active")}
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
            {t("admin.pending")}
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            {t("admin.suspended")}
          </span>
        );
      default:
        return null;
    }
  };

  const getLevelName = (level: number) => {
    if (level >= 10) return "Master";
    if (level >= 7) return "Expert";
    if (level >= 5) return "Advanced";
    if (level >= 3) return "Intermediate";
    return "Beginner";
  };

  const handleEditClick = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
    });
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await authApi.updateProfile({
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        username: formData.username || null,
      });

      if (response.success && response.data) {
        setUser({
          ...user!,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          username: response.data.username,
          avatar: response.data.avatar,
        });
        setIsEditing(false);
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(t("profile.invalidImageType"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t("profile.imageTooLarge"));
      return;
    }

    setIsUploadingAvatar(true);
    setError(null);

    try {
      const response = await authApi.uploadAvatar(file);

      if (response.success && response.data) {
        setUser({
          ...user!,
          avatar: response.data.avatar,
        });
      } else if (response.error) {
        setError(response.error.message);
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user?.avatar) return;

    setIsDeletingAvatar(true);
    setError(null);

    try {
      const response = await authApi.deleteAvatar();

      if (response.success) {
        setUser({
          ...user!,
          avatar: undefined,
        });
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("sidebar.profile")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("profile.updateInfo")}</p>
        </div>
        {!isEditing && (
          <Button
            onClick={handleEditClick}
            variant="outline"
            className="border-border bg-secondary hover:bg-secondary"
          >
            <Pencil className="mr-2 h-4 w-4" />
            {t("common.edit")}
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <Avatar className="h-24 w-24 bg-gradient-to-br from-blue-400 to-blue-600">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.firstName} />
                ) : null}
                <AvatarFallback className="bg-transparent text-3xl font-bold text-foreground">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploadingAvatar}
              />

              <div className="absolute -right-1 -bottom-1 flex gap-1">
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="rounded-full bg-blue-500 p-1.5 text-foreground shadow-lg transition-colors hover:bg-blue-600 disabled:opacity-50"
                  title={t("profile.changeAvatar")}
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                {user?.avatar && (
                  <button
                    onClick={handleDeleteAvatar}
                    disabled={isDeletingAvatar}
                    className="rounded-full bg-red-500 p-1.5 text-foreground shadow-lg transition-colors hover:bg-red-600 disabled:opacity-50"
                    title={t("profile.deleteAvatar")}
                  >
                    {isDeletingAvatar ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.firstName} {user?.lastName}
                </h2>
                {getStatusBadge()}
              </div>
              <p className="mt-1 text-muted-foreground">{getRoleLabel()}</p>
              {user?.username && (
                <p className="mt-1 text-sm text-blue-400">@{user.username}</p>
              )}

              <div className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-foreground sm:justify-start">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.phone}</span>
                </div>
                {user?.telegramUsername && (
                  <div className="flex items-center justify-center gap-2 text-foreground sm:justify-start">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>@{user.telegramUsername}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {user?.role === "student" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.totalPoints")}
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user.points ?? 0}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("course.progress")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("profile.level")}
              </CardTitle>
              <Star className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user.level ?? 1}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {getLevelName(user.level ?? 1)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("dashboard.activeCourses")}
              </CardTitle>
              <BookOpen className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">-</div>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("course.enrolledCourses")}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-border bg-card transition-colors hover:border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">
                {t("dashboard.myCourses")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("dashboard.continueJourney")}
              </p>
            </div>
            <Button asChild variant="ghost" size="icon">
              <Link href="/courses">
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="h-5 w-5" />
            {t("sidebar.account")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName" className="text-muted-foreground">
                    {t("profile.firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1 border-border bg-background/50 text-foreground"
                    placeholder={t("profile.firstName")}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-muted-foreground">
                    {t("profile.lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1 border-border bg-background/50 text-foreground"
                    placeholder={t("profile.lastName")}
                  />
                </div>
                <div>
                  <Label htmlFor="username" className="text-muted-foreground">
                    {t("profile.username")}
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]/g, ""),
                      })
                    }
                    className="mt-1 border-border bg-background/50 text-foreground"
                    placeholder="username"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("profile.usernameHint")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{t("profile.phone")}</Label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-muted-foreground">
                    {user?.phone || "-"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t("profile.phoneCannotChange")}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="border-border bg-secondary hover:bg-secondary"
                >
                  <X className="mr-2 h-4 w-4" />
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("common.save")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profile.firstName")}
                  </label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground">
                    {user?.firstName || "-"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profile.lastName")}
                  </label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground">
                    {user?.lastName || "-"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profile.username")}
                  </label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground">
                    {user?.username ? `@${user.username}` : "-"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("profile.phone")}
                  </label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground">
                    {user?.phone || "-"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t("sidebar.account")}
                  </label>
                  <div className="mt-1 rounded-lg border border-border bg-background/50 px-3 py-2 text-foreground">
                    {getRoleLabel()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-sm text-blue-400">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{t("profile.telegramNote")}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
