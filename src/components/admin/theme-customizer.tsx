"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  Palette,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Eye,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { themeApi } from "@/lib/api/theme";
import type { PlatformTheme } from "@/types/theme";
import { COLOR_PRESETS, FONT_PRESETS } from "@/types/theme";

export function ThemeCustomizer() {
  const [theme, setTheme] = useState<PlatformTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "fonts" | "branding">(
    "colors"
  );

  useEffect(() => {
    fetchTheme();
  }, []);

  const fetchTheme = async () => {
    setIsLoading(true);
    try {
      const { data } = await themeApi.getTheme();
      setTheme(data);
    } catch (error) {
      toast.error("Failed to load theme");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!theme) return;

    setIsSaving(true);
    try {
      const { data } = await themeApi.updateTheme(theme);
      setTheme(data);
      toast.success("Theme updated successfully!");
    } catch (error) {
      toast.error("Failed to save theme");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset to default theme?")) return;

    try {
      const { data } = await themeApi.resetTheme();
      setTheme(data);
      toast.success("Theme reset to default");
    } catch (error) {
      toast.error("Failed to reset theme");
      console.error(error);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const { data } = await themeApi.uploadLogo(file);
      setTheme((prev) => (prev ? { ...prev, logoUrl: data.logoUrl } : null));
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error(error);
    }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      const { data } = await themeApi.uploadFavicon(file);
      setTheme((prev) =>
        prev ? { ...prev, faviconUrl: data.faviconUrl } : null
      );
      toast.success("Favicon uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload favicon");
      console.error(error);
    }
  };

  const applyColorPreset = (presetName: string) => {
    const preset = COLOR_PRESETS.find((p) => p.name === presetName);
    if (preset && theme) {
      setTheme({
        ...theme,
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
      });
    }
  };

  if (isLoading || !theme) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Theme Customization"
            subtitle="Customize your platform's look and feel"
          />
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("/", "_blank")}
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Theme
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card className="border-gray-700 bg-gray-800 p-2">
          <div className="flex gap-2">
            {[
              { id: "colors", label: "Colors", icon: Palette },
              { id: "fonts", label: "Typography", icon: Type },
              { id: "branding", label: "Branding", icon: ImageIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={
                    activeTab === tab.id
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Colors Tab */}
        {activeTab === "colors" && (
          <div className="space-y-6">
            {/* Color Presets */}
            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Color Presets
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset.name)}
                    className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900 p-3 transition-colors hover:bg-gray-700"
                  >
                    <div className="flex gap-1">
                      <div
                        className="h-8 w-8 rounded"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div
                        className="h-8 w-8 rounded"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                      <div
                        className="h-8 w-8 rounded"
                        style={{ backgroundColor: preset.accentColor }}
                      />
                    </div>
                    <span className="text-sm text-white">{preset.name}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Custom Colors */}
            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Custom Colors
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { key: "primaryColor", label: "Primary Color" },
                  { key: "secondaryColor", label: "Secondary Color" },
                  { key: "accentColor", label: "Accent Color" },
                  { key: "backgroundColor", label: "Background Color" },
                  { key: "textColor", label: "Text Color" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm font-medium text-white">
                      {label}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={theme[key as keyof PlatformTheme] as string}
                        onChange={(e) =>
                          setTheme({ ...theme, [key]: e.target.value })
                        }
                        className="h-12 w-16 cursor-pointer rounded-lg border-2 border-gray-700"
                      />
                      <input
                        type="text"
                        value={theme[key as keyof PlatformTheme] as string}
                        onChange={(e) =>
                          setTheme({ ...theme, [key]: e.target.value })
                        }
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 font-mono text-white"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Preview */}
            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Preview</h3>
              <div
                className="space-y-4 rounded-lg p-6"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <h2
                  className="text-2xl font-bold"
                  style={{ color: theme.textColor }}
                >
                  Sample Heading
                </h2>
                <p style={{ color: theme.textColor, opacity: 0.7 }}>
                  This is how your text will look with the selected colors.
                </p>
                <div className="flex gap-3">
                  <button
                    className="rounded-lg px-6 py-2 font-medium text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="rounded-lg px-6 py-2 font-medium text-white"
                    style={{ backgroundColor: theme.secondaryColor }}
                  >
                    Secondary Button
                  </button>
                  <button
                    className="rounded-lg px-6 py-2 font-medium text-white"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === "fonts" && (
          <Card className="border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Typography Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Body Font
                </label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      fontFamily: e.target.value as PlatformTheme["fontFamily"],
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                >
                  {FONT_PRESETS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Heading Font (Optional)
                </label>
                <select
                  value={theme.headingFont || theme.fontFamily}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      headingFont: e.target
                        .value as PlatformTheme["fontFamily"],
                    })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white"
                >
                  <option value="">Same as body font</option>
                  {FONT_PRESETS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Preview */}
              <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
                <h4 className="mb-4 text-sm font-medium text-gray-400">
                  Preview
                </h4>
                <div
                  className="space-y-4"
                  style={{
                    fontFamily: FONT_PRESETS.find(
                      (f) => f.value === theme.fontFamily
                    )?.preview,
                  }}
                >
                  <h1 className="text-4xl font-bold text-white">
                    Heading 1 - The quick brown fox
                  </h1>
                  <h2 className="text-2xl font-semibold text-white">
                    Heading 2 - Jumps over the lazy dog
                  </h2>
                  <p className="text-base text-gray-300">
                    Body text: Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Branding Tab */}
        {activeTab === "branding" && (
          <div className="space-y-6">
            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Brand Identity
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={theme.brandName}
                    onChange={(e) =>
                      setTheme({ ...theme, brandName: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                  />
                </div>
              </div>
            </Card>

            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Logo</h3>
              <div className="flex items-start gap-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLogoUpload(file);
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-700 p-6 transition-colors hover:border-emerald-500"
                  >
                    {theme.logoUrl ? (
                      <img
                        src={theme.logoUrl}
                        alt="Logo"
                        className="h-24 object-contain"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500" />
                        <p className="mt-2 text-sm text-gray-400">
                          Upload Logo
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {theme.logoUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTheme({ ...theme, logoUrl: undefined })}
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </Card>

            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">Favicon</h3>
              <div className="flex items-start gap-4">
                <div>
                  <input
                    type="file"
                    accept="image/x-icon,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFaviconUpload(file);
                    }}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <label
                    htmlFor="favicon-upload"
                    className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-gray-700 p-6 transition-colors hover:border-emerald-500"
                  >
                    {theme.faviconUrl ? (
                      <img
                        src={theme.faviconUrl}
                        alt="Favicon"
                        className="h-16 w-16"
                      />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-500" />
                        <p className="mt-2 text-sm text-gray-400">
                          Upload Favicon
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {theme.faviconUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setTheme({ ...theme, faviconUrl: undefined })
                    }
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                )}
              </div>
            </Card>

            <Card className="border-gray-700 bg-gray-800 p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Additional Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    Border Radius
                  </label>
                  <select
                    value={theme.borderRadius}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        borderRadius: e.target
                          .value as PlatformTheme["borderRadius"],
                      })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                  >
                    <option value="none">None (Square)</option>
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                    <option value="xl">Extra Large</option>
                  </select>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
