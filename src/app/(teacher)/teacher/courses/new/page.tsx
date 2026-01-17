"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/hooks/use-locale";
import { teacherAPI } from "@/lib/api";
import { toast } from "sonner";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewCoursePage() {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("UZS");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    // Auto-generate slug from title
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error(t("teacher.titleRequired"));
      return;
    }

    if (!slug.trim()) {
      toast.error(t("teacher.slugRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await teacherAPI.createCourse({
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        price: price ? parseInt(price, 10) : 0,
        currency,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });

      if (response.success && response.data) {
        toast.success(t("teacher.courseCreated"));
        router.push(`/teacher/courses/${response.data.id}`);
      }
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to create course:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <Link href="/teacher/courses">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("teacher.createCourse")}
        </h1>
        <p className="mt-1 text-gray-400">{t("teacher.createCourseDesc")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-gray-800 bg-gray-800/30">
          <CardHeader>
            <CardTitle className="text-white">
              {t("teacher.courseDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                {t("teacher.courseTitle")} *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="border-gray-700 bg-gray-800 text-white"
                placeholder={t("teacher.courseTitlePlaceholder")}
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-gray-300">
                {t("teacher.courseSlug")} *
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="my-course-slug"
                required
              />
              <p className="text-xs text-gray-500">{t("teacher.slugHelp")}</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">
                {t("teacher.courseDescription")}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 border-gray-700 bg-gray-800 text-white"
                placeholder={t("teacher.courseDescriptionPlaceholder")}
              />
            </div>

            {/* Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">
                  {t("teacher.coursePrice")}
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500">
                  {t("teacher.priceHelp")}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency" className="text-gray-300">
                  {t("teacher.currency")}
                </Label>
                <Input
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                  placeholder="UZS"
                />
              </div>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-gray-300">
                {t("teacher.thumbnailUrl")}
              </Label>
              <Input
                id="thumbnail"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="border-gray-700 bg-gray-800 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/teacher/courses")}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  t("teacher.createCourse")
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
