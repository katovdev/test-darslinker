"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe,
  Search as SearchIcon,
  Image,
  Share2,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { settingsService } from "@/services/settings";
import type {
  SiteSettings,
  TeacherWithSettings,
  TeacherSettingsDetail,
  UpdateSiteSettingsInput,
  UpdateTeacherPageSettingsInput,
  Pagination,
} from "@/lib/api/settings";

type TabType = "site" | "teachers";

export default function AdminSettingsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<TabType>("site");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("admin.settings") || "Settings"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("admin.settingsSubtitle") ||
            "Manage site settings and teacher pages"}
        </p>
      </div>

      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("site")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "site"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="h-4 w-4" />
            {t("admin.siteSettings") || "Site Settings"}
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "teachers"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-4 w-4" />
            {t("admin.teacherPages") || "Teacher Pages"}
          </button>
        </div>
      </div>

      {activeTab === "site" && <SiteSettingsTab />}
      {activeTab === "teachers" && <TeacherPagesTab />}
    </div>
  );
}

function SiteSettingsTab() {
  const t = useTranslations();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateSiteSettingsInput>({});

  const loadSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.getSiteSettings();
      if (data) {
        setSettings(data);
        setFormData({
          siteTitle: data.siteTitle,
          siteDescription: data.siteDescription,
          siteKeywords: data.siteKeywords,
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          ogImage: data.ogImage,
          twitterCard: data.twitterCard as "summary" | "summary_large_image",
          twitterSite: data.twitterSite,
          twitterCreator: data.twitterCreator,
          googleAnalyticsId: data.googleAnalyticsId,
          facebookPixelId: data.facebookPixelId,
          faviconUrl: data.faviconUrl,
          logoUrl: data.logoUrl,
          footerText: data.footerText,
          supportEmail: data.supportEmail,
          supportPhone: data.supportPhone,
          address: data.address,
          socialLinks: data.socialLinks,
          maintenanceMode: data.maintenanceMode,
          registrationEnabled: data.registrationEnabled,
        });
      }
    } catch {
      setError(t("admin.settingsLoadError") || "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const result = await settingsService.updateSiteSettings(formData);
      if (result) {
        setSettings(result);
        setSuccessMessage(
          t("admin.settingsSaved") || "Settings saved successfully"
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      setError(t("admin.settingsSaveError") || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof UpdateSiteSettingsInput>(
    field: K,
    value: UpdateSiteSettingsInput[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateSocialLink = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value || null,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-card p-6"
          >
            <div className="mb-4 h-6 w-32 rounded bg-secondary/50" />
            <div className="space-y-3">
              <div className="h-10 rounded bg-secondary/50" />
              <div className="h-10 rounded bg-secondary/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <SearchIcon className="h-5 w-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.seoSettings") || "SEO Settings"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.siteTitle") || "Site Title"}
              </label>
              <input
                type="text"
                value={formData.siteTitle || ""}
                onChange={(e) => updateField("siteTitle", e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.siteDescription") || "Meta Description"}
              </label>
              <textarea
                value={formData.siteDescription || ""}
                onChange={(e) =>
                  updateField("siteDescription", e.target.value || null)
                }
                rows={3}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.siteKeywords") || "Keywords (comma-separated)"}
              </label>
              <input
                type="text"
                value={formData.siteKeywords || ""}
                onChange={(e) =>
                  updateField("siteKeywords", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.openGraph") || "Open Graph"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.ogTitle") || "OG Title"}
              </label>
              <input
                type="text"
                value={formData.ogTitle || ""}
                onChange={(e) => updateField("ogTitle", e.target.value || null)}
                placeholder={formData.siteTitle || ""}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.ogDescription") || "OG Description"}
              </label>
              <textarea
                value={formData.ogDescription || ""}
                onChange={(e) =>
                  updateField("ogDescription", e.target.value || null)
                }
                rows={2}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.ogImage") || "OG Image URL"}
              </label>
              <input
                type="url"
                value={formData.ogImage || ""}
                onChange={(e) => updateField("ogImage", e.target.value || null)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-sky-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.twitterCard") || "Twitter Card"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.cardType") || "Card Type"}
              </label>
              <select
                value={formData.twitterCard || "summary_large_image"}
                onChange={(e) =>
                  updateField(
                    "twitterCard",
                    e.target.value as "summary" | "summary_large_image"
                  )
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.twitterSite") || "Twitter @username"}
              </label>
              <input
                type="text"
                value={formData.twitterSite || ""}
                onChange={(e) =>
                  updateField("twitterSite", e.target.value || null)
                }
                placeholder="@darslinker"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.analytics") || "Analytics"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.googleAnalytics") || "Google Analytics ID"}
              </label>
              <input
                type="text"
                value={formData.googleAnalyticsId || ""}
                onChange={(e) =>
                  updateField("googleAnalyticsId", e.target.value || null)
                }
                placeholder="G-XXXXXXXXXX"
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.facebookPixel") || "Facebook Pixel ID"}
              </label>
              <input
                type="text"
                value={formData.facebookPixelId || ""}
                onChange={(e) =>
                  updateField("facebookPixelId", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Image className="h-5 w-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.branding") || "Branding"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.faviconUrl") || "Favicon URL"}
              </label>
              <input
                type="url"
                value={formData.faviconUrl || ""}
                onChange={(e) =>
                  updateField("faviconUrl", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.logoUrl") || "Logo URL"}
              </label>
              <input
                type="url"
                value={formData.logoUrl || ""}
                onChange={(e) => updateField("logoUrl", e.target.value || null)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                {t("admin.footerText") || "Footer Text"}
              </label>
              <input
                type="text"
                value={formData.footerText || ""}
                onChange={(e) =>
                  updateField("footerText", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.contactInfo") || "Contact Info"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {t("admin.supportEmail") || "Support Email"}
              </label>
              <input
                type="email"
                value={formData.supportEmail || ""}
                onChange={(e) =>
                  updateField("supportEmail", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                {t("admin.supportPhone") || "Support Phone"}
              </label>
              <input
                type="tel"
                value={formData.supportPhone || ""}
                onChange={(e) =>
                  updateField("supportPhone", e.target.value || null)
                }
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {t("admin.address") || "Address"}
              </label>
              <input
                type="text"
                value={formData.address || ""}
                onChange={(e) => updateField("address", e.target.value || null)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.socialLinks") || "Social Links"}
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Telegram
              </label>
              <input
                type="url"
                value={formData.socialLinks?.telegram || ""}
                onChange={(e) => updateSocialLink("telegram", e.target.value)}
                placeholder="https://t.me/..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks?.instagram || ""}
                onChange={(e) => updateSocialLink("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                YouTube
              </label>
              <input
                type="url"
                value={formData.socialLinks?.youtube || ""}
                onChange={(e) => updateSocialLink("youtube", e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks?.facebook || ""}
                onChange={(e) => updateSocialLink("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-foreground">
              {t("admin.featureFlags") || "Feature Flags"}
            </h3>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <span className="text-foreground">
                  {t("admin.maintenanceMode") || "Maintenance Mode"}
                </span>
                <p className="text-sm text-muted-foreground">
                  {t("admin.maintenanceModeDesc") ||
                    "Disable site access for visitors"}
                </p>
              </div>
              <button
                onClick={() =>
                  updateField("maintenanceMode", !formData.maintenanceMode)
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  formData.maintenanceMode ? "bg-red-500" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    formData.maintenanceMode ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <div>
                <span className="text-foreground">
                  {t("admin.registrationEnabled") || "Registration Enabled"}
                </span>
                <p className="text-sm text-muted-foreground">
                  {t("admin.registrationEnabledDesc") ||
                    "Allow new user registration"}
                </p>
              </div>
              <button
                onClick={() =>
                  updateField(
                    "registrationEnabled",
                    !formData.registrationEnabled
                  )
                }
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  formData.registrationEnabled
                    ? "bg-emerald-500"
                    : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    formData.registrationEnabled ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-medium text-foreground transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          <Save className={`h-4 w-4 ${isSaving ? "animate-spin" : ""}`} />
          {isSaving
            ? t("common.saving") || "Saving..."
            : t("common.saveChanges") || "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ========== Teacher Pages Tab ==========
function TeacherPagesTab() {
  const t = useTranslations();
  const [teachers, setTeachers] = useState<TeacherWithSettings[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Edit modal state
  const [editingTeacher, setEditingTeacher] =
    useState<TeacherSettingsDetail | null>(null);
  const [editForm, setEditForm] = useState<UpdateTeacherPageSettingsInput>({});
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadTeachers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await settingsService.listTeachers({
        page,
        limit: 20,
        search: search || undefined,
      });
      if (data) {
        setTeachers(data.teachers);
        setPagination(data.pagination);
      }
    } catch {
      setError(t("admin.teachersLoadError") || "Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const openEditModal = async (teacherId: string) => {
    try {
      const data = await settingsService.getTeacherSettings(teacherId);
      if (data) {
        setEditingTeacher(data);
        setEditForm({
          metaTitle: data.pageSettings.metaTitle,
          metaDescription: data.pageSettings.metaDescription,
          bannerUrl: data.pageSettings.bannerUrl,
          tagline: data.pageSettings.tagline,
          aboutText: data.pageSettings.aboutText,
          telegramUrl: data.pageSettings.telegramUrl,
          instagramUrl: data.pageSettings.instagramUrl,
          youtubeUrl: data.pageSettings.youtubeUrl,
          websiteUrl: data.pageSettings.websiteUrl,
          linkedinUrl: data.pageSettings.linkedinUrl,
          showCoursesCount: data.pageSettings.showCoursesCount,
          showStudentsCount: data.pageSettings.showStudentsCount,
          showRating: data.pageSettings.showRating,
          publicEmail: data.pageSettings.publicEmail,
          publicPhone: data.pageSettings.publicPhone,
        });
      }
    } catch {
      setError(
        t("admin.teacherLoadError") || "Failed to load teacher settings"
      );
    }
  };

  const handleSaveTeacher = async () => {
    if (!editingTeacher) return;
    setIsSaving(true);
    try {
      await settingsService.updateTeacherSettings(
        editingTeacher.teacher.id,
        editForm
      );
      setSuccessMessage(t("admin.teacherSaved") || "Teacher settings saved");
      setEditingTeacher(null);
      loadTeachers();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      setError(
        t("admin.teacherSaveError") || "Failed to save teacher settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditField = <K extends keyof UpdateTeacherPageSettingsInput>(
    field: K,
    value: UpdateTeacherPageSettingsInput[K]
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      <div className="flex gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("admin.searchTeachers") || "Search teachers..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary py-2 pr-4 pl-10 text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-emerald-500"
          >
            {t("common.search") || "Search"}
          </button>
        </form>
        <button
          onClick={loadTeachers}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-secondary/50" />
                <div className="flex-1">
                  <div className="mb-1 h-4 w-24 rounded bg-secondary/50" />
                  <div className="h-3 w-16 rounded bg-secondary/50" />
                </div>
              </div>
              <div className="h-8 rounded bg-secondary/50" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && teachers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
                  {teacher.logoUrl ? (
                    <img
                      src={teacher.logoUrl}
                      alt={
                        teacher.businessName ||
                        `${teacher.firstName} ${teacher.lastName}`
                      }
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-emerald-400">
                      {teacher.firstName[0]}
                      {teacher.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {teacher.businessName ||
                      `${teacher.firstName} ${teacher.lastName}`}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    @{teacher.username || teacher.id}
                  </p>
                </div>
                {teacher.hasPageSettings ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div className="mb-4 flex gap-4 text-sm text-muted-foreground">
                <span>{teacher.coursesCount} courses</span>
                <span>{teacher.studentsCount} students</span>
              </div>
              <button
                onClick={() => openEditModal(teacher.id)}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-emerald-500 hover:text-emerald-400"
              >
                <Edit className="h-4 w-4" />
                {t("admin.editSettings") || "Edit Settings"}
              </button>
            </div>
          ))}
        </div>
      )}

      {!isLoading && teachers.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {t("admin.noTeachers") || "No teachers found"}
          </p>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("common.showing") || "Showing"}{" "}
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            {t("common.of") || "of"} {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous") || "Previous"}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
            >
              {t("common.next") || "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">
                {t("admin.editTeacherPage") || "Edit Teacher Page"}:{" "}
                {editingTeacher.teacher.firstName}{" "}
                {editingTeacher.teacher.lastName}
              </h2>
              <button
                onClick={() => setEditingTeacher(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  {t("admin.pageSeo") || "Page SEO"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.metaTitle") || "Meta Title"}
                    </label>
                    <input
                      type="text"
                      value={editForm.metaTitle || ""}
                      onChange={(e) =>
                        updateEditField("metaTitle", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.metaDescription") || "Meta Description"}
                    </label>
                    <textarea
                      value={editForm.metaDescription || ""}
                      onChange={(e) =>
                        updateEditField(
                          "metaDescription",
                          e.target.value || null
                        )
                      }
                      rows={2}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  {t("admin.branding") || "Branding"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.bannerUrl") || "Banner Image URL"}
                    </label>
                    <input
                      type="url"
                      value={editForm.bannerUrl || ""}
                      onChange={(e) =>
                        updateEditField("bannerUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.tagline") || "Tagline"}
                    </label>
                    <input
                      type="text"
                      value={editForm.tagline || ""}
                      onChange={(e) =>
                        updateEditField("tagline", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.aboutText") || "About Text"}
                    </label>
                    <textarea
                      value={editForm.aboutText || ""}
                      onChange={(e) =>
                        updateEditField("aboutText", e.target.value || null)
                      }
                      rows={4}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  {t("admin.socialLinks") || "Social Links"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Telegram
                    </label>
                    <input
                      type="url"
                      value={editForm.telegramUrl || ""}
                      onChange={(e) =>
                        updateEditField("telegramUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={editForm.instagramUrl || ""}
                      onChange={(e) =>
                        updateEditField("instagramUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      YouTube
                    </label>
                    <input
                      type="url"
                      value={editForm.youtubeUrl || ""}
                      onChange={(e) =>
                        updateEditField("youtubeUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.websiteUrl || ""}
                      onChange={(e) =>
                        updateEditField("websiteUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={editForm.linkedinUrl || ""}
                      onChange={(e) =>
                        updateEditField("linkedinUrl", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  {t("admin.displaySettings") || "Display Settings"}
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-foreground">
                      {t("admin.showCoursesCount") || "Show Courses Count"}
                    </span>
                    <button
                      onClick={() =>
                        updateEditField(
                          "showCoursesCount",
                          !editForm.showCoursesCount
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        editForm.showCoursesCount
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          editForm.showCoursesCount ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-foreground">
                      {t("admin.showStudentsCount") || "Show Students Count"}
                    </span>
                    <button
                      onClick={() =>
                        updateEditField(
                          "showStudentsCount",
                          !editForm.showStudentsCount
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        editForm.showStudentsCount
                          ? "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          editForm.showStudentsCount ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-foreground">
                      {t("admin.showRating") || "Show Rating"}
                    </span>
                    <button
                      onClick={() =>
                        updateEditField("showRating", !editForm.showRating)
                      }
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        editForm.showRating ? "bg-emerald-500" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                          editForm.showRating ? "left-5" : "left-0.5"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="mb-4 font-semibold text-foreground">
                  {t("admin.publicContact") || "Public Contact"}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.publicEmail") || "Public Email"}
                    </label>
                    <input
                      type="email"
                      value={editForm.publicEmail || ""}
                      onChange={(e) =>
                        updateEditField("publicEmail", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      {t("admin.publicPhone") || "Public Phone"}
                    </label>
                    <input
                      type="tel"
                      value={editForm.publicPhone || ""}
                      onChange={(e) =>
                        updateEditField("publicPhone", e.target.value || null)
                      }
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-foreground focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingTeacher(null)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-foreground transition-colors hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleSaveTeacher}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-foreground transition-colors hover:bg-emerald-500 disabled:opacity-50"
              >
                <Save className={`h-4 w-4 ${isSaving ? "animate-spin" : ""}`} />
                {isSaving
                  ? t("common.saving") || "Saving..."
                  : t("common.save") || "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
