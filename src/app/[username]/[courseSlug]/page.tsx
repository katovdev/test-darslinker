"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Users,
  Play,
  FileText,
  ChevronDown,
  ChevronRight,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslations } from "@/hooks/use-locale";
import { useIsAuthenticated } from "@/store";
import {
  publicPathAPI,
  type PathTeacher,
  type PathCourseDetail,
  type PathModule,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ username: string; courseSlug: string }>;
}

const lessonIcons: Record<string, typeof Play> = {
  video: Play,
  text: FileText,
};

export default function CoursePublicPage({ params }: PageProps) {
  const { username, courseSlug } = use(params);
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Pick<
    PathTeacher,
    | "id"
    | "username"
    | "fullName"
    | "businessName"
    | "logoUrl"
    | "specialization"
  > | null>(null);
  const [course, setCourse] = useState<PathCourseDetail | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const primaryColor = "#7EA2D4";
  const backgroundColor = "#1a1a1a";
  const textColor = "#ffffff";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await publicPathAPI.getCourseByPath(
          username,
          courseSlug
        );

        if (response.success && response.data) {
          setTeacher(response.data.teacher);
          setCourse(response.data.course);

          // Auto-expand first module
          if (response.data.course.modules?.length > 0) {
            setExpandedModules([response.data.course.modules[0].id]);
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("not_found");
      } finally {
        setIsLoading(false);
      }
    };

    if (username && courseSlug) {
      loadData();
    }
  }, [username, courseSlug]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: course?.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success(t("common.copied"));
      }
    } catch {
      // User cancelled share
    }
  };

  const totalLessons =
    course?.modules?.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0
    ) || 0;

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Skeleton className="h-10 w-32 bg-gray-700" />
          <Skeleton className="mt-6 h-64 w-full rounded-xl bg-gray-700" />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg bg-gray-700" />
              ))}
            </div>
            <Skeleton className="h-64 rounded-lg bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  if (error === "not_found" || !course || !teacher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
        <div className="text-center">
          <div className="mb-6 text-8xl opacity-30">404</div>
          <h1
            className="mb-4 text-4xl font-bold"
            style={{ color: primaryColor }}
          >
            {t("course.courseNotFound")}
          </h1>
          <p className="mb-8 max-w-md text-gray-400">
            The course you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href={`/${username}`}>
            <Button
              className="text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {t("common.back")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Back Button */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-6 text-gray-400 hover:text-white"
        >
          <Link href={`/${username}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>

        {/* Course Hero */}
        <Card className="overflow-hidden border-gray-800 bg-gray-800/30">
          <div className="relative aspect-video max-h-80 overflow-hidden bg-gray-700">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
            <div className="absolute right-0 bottom-0 left-0 p-6">
              <Badge
                className="mb-2"
                style={{
                  backgroundColor: course.price ? `${primaryColor}33` : primaryColor,
                  color: course.price ? textColor : "#fff",
                }}
              >
                {course.price
                  ? `${course.price.toLocaleString()} UZS`
                  : t("landing.free")}
              </Badge>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {course.title}
              </h1>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Modules List */}
          <div className="space-y-4 lg:col-span-2">
            {/* Description */}
            {course.description && (
              <Card className="border-gray-800 bg-gray-800/30">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    {t("course.about")}
                  </h2>
                  <p className="whitespace-pre-wrap text-gray-300">
                    {course.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Course Content */}
            <h2 className="text-xl font-semibold text-white">
              {t("course.content")}
            </h2>

            {course.modules?.map((module, moduleIndex) => (
              <ModuleCard
                key={module.id}
                module={module}
                moduleIndex={moduleIndex}
                username={username}
                courseSlug={courseSlug}
                isExpanded={expandedModules.includes(module.id)}
                onToggle={() => toggleModule(module.id)}
                primaryColor={primaryColor}
              />
            ))}

            {(!course.modules || course.modules.length === 0) && (
              <Card className="border-gray-800 bg-gray-800/30">
                <CardContent className="py-8 text-center">
                  <p className="text-gray-400">No content available yet.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Enroll Card */}
            <Card className="border-gray-800 bg-gray-800/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {t("course.enrollNow")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isAuthenticated ? (
                  <Button
                    className="w-full text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {course.price ? t("course.buyNow") : t("course.enrollFree")}
                  </Button>
                ) : (
                  <>
                    <p className="text-sm text-gray-400">
                      {t("course.loginToEnroll")}
                    </p>
                    <Button
                      asChild
                      className="w-full text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Link
                        href={`/login?redirect=/${username}/${courseSlug}`}
                      >
                        {t("landing.login")}
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-gray-700 text-white hover:bg-gray-800"
                    >
                      <Link
                        href={`/register?redirect=/${username}/${courseSlug}`}
                      >
                        {t("landing.register")}
                      </Link>
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full gap-2 border-gray-700 text-white hover:bg-gray-800"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  {t("common.share")}
                </Button>
              </CardContent>
            </Card>

            {/* Course Info */}
            <Card className="border-gray-800 bg-gray-800/30">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("course.totalLessons")}
                    </p>
                    <p className="font-medium text-white">{totalLessons}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("course.duration")}
                    </p>
                    <p className="font-medium text-white">
                      {course.totalDuration} {t("common.minutes")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Users className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("landing.enrolled")}
                    </p>
                    <p className="font-medium text-white">
                      {course.enrollmentsCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Info */}
            <Card className="border-gray-800 bg-gray-800/30">
              <CardContent className="pt-6">
                <Link href={`/${username}`} className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {teacher.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-white">{teacher.fullName}</p>
                    {teacher.specialization && (
                      <p className="text-sm text-gray-400">
                        {teacher.specialization}
                      </p>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: PathModule;
  moduleIndex: number;
  username: string;
  courseSlug: string;
  isExpanded: boolean;
  onToggle: () => void;
  primaryColor: string;
}

function ModuleCard({
  module,
  moduleIndex,
  username,
  courseSlug,
  isExpanded,
  onToggle,
  primaryColor,
}: ModuleCardProps) {
  const t = useTranslations();

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-gray-800 bg-gray-800/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${primaryColor}20`,
                    color: primaryColor,
                  }}
                >
                  {moduleIndex + 1}
                </span>
                <div>
                  <CardTitle className="text-base text-white">
                    {module.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    {module.lessonsCount} {t("course.lessons")}
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
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="border-t border-gray-800 pt-4">
            <div className="space-y-2">
              {module.lessons?.map((lesson, lessonIndex) => {
                const Icon = lessonIcons[lesson.type] || FileText;

                return (
                  <Link
                    key={lesson.id}
                    href={`/${username}/${courseSlug}/${lesson.slug}`}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
                      <Icon className="h-4 w-4" />
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
                        {lesson.durationMins > 0 && (
                          <span>{lesson.durationMins} min</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
