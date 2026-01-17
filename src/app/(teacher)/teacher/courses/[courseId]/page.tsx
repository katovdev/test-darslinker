"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Plus,
  Save,
  Trash2,
  GripVertical,
  ChevronDown,
  Play,
  FileText,
  HelpCircle,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslations } from "@/hooks/use-locale";
import {
  teacherAPI,
  type TeacherCourseDetail,
  type TeacherModule,
} from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const lessonIcons = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  assignment: File,
};

export default function CourseEditorPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<TeacherCourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("UZS");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const loadCourse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getCourseById(courseId);
      if (response.success && response.data) {
        const data = response.data;
        setCourse(data);
        setTitle(data.title);
        setSlug(data.slug);
        setDescription(data.description || "");
        setPrice(data.price?.toString() || "0");
        setCurrency(data.currency || "UZS");
        setThumbnailUrl(data.thumbnailUrl || "");

        // Expand first module by default
        if (data.modules?.length > 0) {
          setExpandedModules([data.modules[0].id]);
        }
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load course:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(t("teacher.titleRequired"));
      return;
    }

    setIsSaving(true);

    try {
      const response = await teacherAPI.updateCourse(courseId, {
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim() || undefined,
        price: price ? parseInt(price, 10) : 0,
        currency,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      });

      if (response.success) {
        toast.success(t("teacher.courseSaved"));
      }
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to save course:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32 bg-gray-700" />
        <Skeleton className="h-8 w-64 bg-gray-700" />
        <Skeleton className="h-96 w-full bg-gray-700" />
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="space-y-6">
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
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">
              {error || t("teacher.courseNotFound")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <Link href="/teacher/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{course.title}</h1>
            <Badge
              variant="outline"
              className={cn(
                course.status === "published"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-gray-500/20 bg-gray-500/10 text-gray-400"
              )}
            >
              {t(`teacher.status.${course.status}`)}
            </Badge>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("common.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t("common.save")}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.courseDetails")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  {t("teacher.courseTitle")} *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-300">
                  {t("teacher.courseSlug")}
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="border-gray-700 bg-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  {t("teacher.courseDescription")}
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24 border-gray-700 bg-gray-800 text-white"
                />
              </div>

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
                  />
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
                  />
                </div>
              </div>

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
                />
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">
                {t("teacher.modules")}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("teacher.addModule")}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {course.modules?.length === 0 && (
                <p className="py-8 text-center text-gray-400">
                  {t("teacher.noModules")}
                </p>
              )}

              {course.modules?.map((module, moduleIndex) => (
                <ModuleItem
                  key={module.id}
                  module={module}
                  moduleIndex={moduleIndex}
                  isExpanded={expandedModules.includes(module.id)}
                  onToggle={() => toggleModule(module.id)}
                  courseId={courseId}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thumbnail Preview */}
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.preview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video overflow-hidden rounded-lg bg-gray-700">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-12 w-12 text-gray-600" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("teacher.courseStats")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("teacher.modules")}</span>
                <span className="text-white">{course.moduleCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("course.lessons")}</span>
                <span className="text-white">{course.lessonCount || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">{t("teacher.enrolled")}</span>
                <span className="text-white">{course.enrolledCount || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ModuleItemProps {
  module: TeacherModule;
  moduleIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  courseId: string;
}

function ModuleItem({
  module,
  moduleIndex,
  isExpanded,
  onToggle,
  courseId,
}: ModuleItemProps) {
  const t = useTranslations();

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <div className="rounded-lg border border-gray-800 bg-gray-800/50">
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center justify-between p-4 hover:bg-gray-800/70">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-gray-500" />
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#7EA2D4]/10 text-xs font-medium text-[#7EA2D4]">
                {moduleIndex + 1}
              </span>
              <div>
                <h4 className="font-medium text-white">{module.title}</h4>
                <p className="text-xs text-gray-400">
                  {module.lessonCount} {t("course.lessons")}
                </p>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-5 w-5 text-gray-400 transition-transform",
                isExpanded && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-gray-800 p-4">
            {module.lessons?.length === 0 && (
              <p className="py-4 text-center text-sm text-gray-500">
                {t("teacher.noLessons")}
              </p>
            )}

            <div className="space-y-2">
              {module.lessons?.map((lesson, lessonIndex) => {
                const Icon = lessonIcons[lesson.type] || FileText;
                return (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-3 rounded-lg bg-gray-800/30 p-3"
                  >
                    <GripVertical className="h-4 w-4 text-gray-500" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {lessonIndex + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge
                          variant="outline"
                          className="border-gray-700 text-gray-400"
                        >
                          {t(`lesson.${lesson.type}`)}
                        </Badge>
                        {lesson.isFree && (
                          <Badge
                            variant="outline"
                            className="border-green-500/20 bg-green-500/10 text-green-400"
                          >
                            {t("course.free")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("teacher.addLesson")}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
