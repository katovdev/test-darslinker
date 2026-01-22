"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
import {
  Home,
  Image as ImageIcon,
  Users,
  Star,
  MessageSquare,
  Plus,
  Trash2,
  Save,
  Eye,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { landingPageApi } from "@/lib/api/landing-page";
import type {
  LandingPageContent,
  Feature,
  Testimonial,
  SocialLink,
} from "@/types/landing-page";

export function LandingPageEditor() {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const { data } = await landingPageApi.getContent();
      setContent(data);
    } catch (error) {
      toast.error("Failed to load landing page content");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setIsSaving(true);
    try {
      const { data } = await landingPageApi.updateContent(content);
      setContent(data);
      toast.success("Landing page updated successfully!");
    } catch (error) {
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (section: "hero" | "about", file: File) => {
    try {
      const uploadFn =
        section === "hero"
          ? landingPageApi.uploadHeroImage
          : landingPageApi.uploadAboutImage;
      const { data } = await uploadFn(file);

      setContent((prev) =>
        prev
          ? {
              ...prev,
              [section === "hero" ? "heroBackgroundImage" : "aboutImage"]:
                data.imageUrl,
            }
          : null
      );
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    }
  };

  const addFeature = () => {
    if (!content) return;
    const newFeature: Feature = {
      id: Date.now().toString(),
      icon: "✨",
      title: "New Feature",
      description: "Feature description",
      order: content.features.length,
    };
    setContent({
      ...content,
      features: [...content.features, newFeature],
    });
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    if (!content) return;
    setContent({
      ...content,
      features: content.features.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      ),
    });
  };

  const removeFeature = (id: string) => {
    if (!content) return;
    setContent({
      ...content,
      features: content.features.filter((f) => f.id !== id),
    });
  };

  const addTestimonial = () => {
    if (!content) return;
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      studentName: "Student Name",
      content: "Testimonial content",
      rating: 5,
      order: content.testimonials.length,
    };
    setContent({
      ...content,
      testimonials: [...content.testimonials, newTestimonial],
    });
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    if (!content) return;
    setContent({
      ...content,
      testimonials: content.testimonials.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  };

  const removeTestimonial = (id: string) => {
    if (!content) return;
    setContent({
      ...content,
      testimonials: content.testimonials.filter((t) => t.id !== id),
    });
  };

  if (isLoading || !content) {
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
            title="Landing Page Editor"
            subtitle="Customize your platform's landing page"
          />
          <div className="flex gap-3">
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section Tabs */}
        <Card className="border-gray-700 bg-gray-800 p-2">
          <div className="flex flex-wrap gap-2">
            {[
              { id: "hero", label: "Hero", icon: Home },
              { id: "about", label: "About", icon: Users },
              { id: "features", label: "Features", icon: Star },
              {
                id: "testimonials",
                label: "Testimonials",
                icon: MessageSquare,
              },
            ].map((section) => {
              const Icon = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  onClick={() => setActiveSection(section.id)}
                  className={
                    activeSection === section.id
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Hero Section */}
        {activeSection === "hero" && (
          <Card className="border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Hero Section
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title
                </label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Subtitle
                </label>
                <textarea
                  value={content.heroSubtitle}
                  onChange={(e) =>
                    setContent({ ...content, heroSubtitle: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    value={content.heroCtaText}
                    onChange={(e) =>
                      setContent({ ...content, heroCtaText: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={content.heroCtaLink}
                    onChange={(e) =>
                      setContent({ ...content, heroCtaLink: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Background Image
                </label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("hero", file);
                    }}
                    className="hidden"
                    id="hero-image"
                  />
                  <label
                    htmlFor="hero-image"
                    className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-4 text-center transition-colors hover:border-emerald-500"
                  >
                    <Upload className="mx-auto h-6 w-6 text-gray-500" />
                    <p className="mt-2 text-sm text-gray-400">Upload Image</p>
                  </label>
                  {content.heroBackgroundImage && (
                    <div className="relative">
                      <img
                        src={content.heroBackgroundImage}
                        alt="Hero background"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                      <button
                        onClick={() =>
                          setContent({
                            ...content,
                            heroBackgroundImage: undefined,
                          })
                        }
                        className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* About Section */}
        {activeSection === "about" && (
          <Card className="border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">
              About Section
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Title
                </label>
                <input
                  type="text"
                  value={content.aboutTitle}
                  onChange={(e) =>
                    setContent({ ...content, aboutTitle: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Content (Markdown)
                </label>
                <MarkdownEditor
                  value={content.aboutContent}
                  onChange={(value) =>
                    setContent({ ...content, aboutContent: value })
                  }
                  minHeight={200}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Features Section */}
        {activeSection === "features" && (
          <Card className="border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Features</h3>
              <Button
                onClick={addFeature}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Feature
              </Button>
            </div>
            <div className="space-y-4">
              {content.features.map((feature) => (
                <Card
                  key={feature.id}
                  className="border-gray-700 bg-gray-900 p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-12">
                    <div className="sm:col-span-1">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) =>
                          updateFeature(feature.id, { icon: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2 py-2 text-center text-2xl"
                        maxLength={2}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) =>
                          updateFeature(feature.id, { title: e.target.value })
                        }
                        placeholder="Feature title"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) =>
                          updateFeature(feature.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Feature description"
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFeature(feature.id)}
                        className="w-full border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Testimonials Section */}
        {activeSection === "testimonials" && (
          <Card className="border-gray-700 bg-gray-800 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Testimonials</h3>
              <Button
                onClick={addTestimonial}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </div>
            <div className="space-y-4">
              {content.testimonials.map((testimonial) => (
                <Card
                  key={testimonial.id}
                  className="border-gray-700 bg-gray-900 p-4"
                >
                  <div className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        type="text"
                        value={testimonial.studentName}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, {
                            studentName: e.target.value,
                          })
                        }
                        placeholder="Student name"
                        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        value={testimonial.studentTitle || ""}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, {
                            studentTitle: e.target.value,
                          })
                        }
                        placeholder="Title (e.g., Frontend Developer)"
                        className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                      />
                    </div>
                    <textarea
                      value={testimonial.content}
                      onChange={(e) =>
                        updateTestimonial(testimonial.id, {
                          content: e.target.value,
                        })
                      }
                      placeholder="Testimonial content"
                      rows={3}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Rating:</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={testimonial.rating}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, {
                              rating: parseInt(e.target.value),
                            })
                          }
                          className="w-16 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1 text-white"
                        />
                        <span className="text-yellow-500">★</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
