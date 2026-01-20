"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-locale";
import { useIsAuthenticated } from "@/store";
import {
  publicPathAPI,
  type PathTeacher,
  type PathLessonDetail,
  type LessonNavigation,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ username: string; courseSlug: string; lessonSlug: string }>;
}

export default function LessonPublicPage({ params }: PageProps) {
  const { username, courseSlug, lessonSlug } = use(params);
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<Pick<
    PathTeacher,
    "id" | "username" | "fullName"
  > | null>(null);
  const [course, setCourse] = useState<{
    id: string;
    title: string;
    slug: string;
  } | null>(null);
  const [module, setModule] = useState<{
    id: string;
    title: string;
    slug: string;
  } | null>(null);
  const [lesson, setLesson] = useState<PathLessonDetail | null>(null);
  const [navigation, setNavigation] = useState<LessonNavigation | null>(null);

  const primaryColor = "#7EA2D4";
  const backgroundColor = "#1a1a1a";
  const textColor = "#ffffff";

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await publicPathAPI.getLessonByPath(
        username,
        courseSlug,
        lessonSlug
      );

      if (response.success && response.data) {
        setTeacher(response.data.teacher);
        setCourse(response.data.course);
        setModule(response.data.module);
        setLesson(response.data.lesson);
        setNavigation(response.data.navigation);
      }
    } catch (err) {
      console.error("Failed to load lesson:", err);
      setError("not_found");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username && courseSlug && lessonSlug) {
      loadData();
    }
  }, [username, courseSlug, lessonSlug]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: primaryColor }}
          />
        </div>
      </div>
    );
  }

  if (error === "not_found" || !lesson || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto mb-6 w-fit rounded-full bg-red-500/10 p-4">
            <BookOpen className="h-8 w-8 text-red-500" />
          </div>
          <h1
            className="mb-4 text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            {t("lesson.lessonNotFound")}
          </h1>
          <p className="mb-8 max-w-md text-gray-400">
            The lesson you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <div className="flex justify-center gap-2">
            <Button
              onClick={loadData}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
            <Link href={`/${username}/${courseSlug}`}>
              <Button
                className="text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {t("lesson.backToCourse")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if user needs to enroll/login to view content
  const needsAuth = !isAuthenticated;

  return (
    <div className="min-h-screen" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-400">
          <Link href={`/${username}`} className="hover:text-white">
            {teacher?.fullName}
          </Link>
          <span>/</span>
          <Link
            href={`/${username}/${courseSlug}`}
            className="hover:text-white"
          >
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-white">{lesson.title}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            <Link href={`/${username}/${courseSlug}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("lesson.backToCourse")}
            </Link>
          </Button>
        </div>

        {/* Lesson Title */}
        <div className="mb-6">
          <Badge
            variant="outline"
            className="mb-2 border-gray-700 text-gray-400"
          >
            {t(`lesson.${lesson.type}`)}
          </Badge>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {lesson.title}
          </h1>
          {module && (
            <p className="mt-2 text-gray-400">
              {t("course.module")}: {module.title}
            </p>
          )}
        </div>

        {/* Content */}
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="p-6">
            {needsAuth ? (
              // Login prompt for unauthenticated users
              <div className="flex flex-col items-center gap-6 py-12 text-center">
                <div
                  className="rounded-full p-4"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Lock className="h-8 w-8" style={{ color: primaryColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {t("course.loginToView")}
                  </h2>
                  <p className="mt-2 text-gray-400">
                    {t("course.loginToViewDesc")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    asChild
                    className="text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Link
                      href={`/login?redirect=/${username}/${courseSlug}/${lessonSlug}`}
                    >
                      {t("landing.login")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Link
                      href={`/register?redirect=/${username}/${courseSlug}/${lessonSlug}`}
                    >
                      {t("landing.register")}
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              // Actual lesson content
              <>
                {/* Video Content */}
                {lesson.type === "video" && lesson.videoUrl && (
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="h-full w-full"
                      controlsList="nodownload"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}

                {/* Text Content */}
                {lesson.type === "text" && lesson.content && (
                  <div className="prose prose-invert max-w-none">
                    <div
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                      className="text-gray-300"
                    />
                  </div>
                )}

                {/* Empty state */}
                {!lesson.videoUrl && !lesson.content && (
                  <div className="py-12 text-center text-gray-400">
                    No content available for this lesson.
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {navigation?.prev ? (
            <Button
              asChild
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Link href={`/${username}/${courseSlug}/${navigation.prev.slug}`}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {navigation.prev.title}
                </span>
                <span className="sm:hidden">{t("lesson.previousLesson")}</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}

          {navigation?.next ? (
            <Button
              asChild
              className="text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Link href={`/${username}/${courseSlug}/${navigation.next.slug}`}>
                <span className="hidden sm:inline">
                  {navigation.next.title}
                </span>
                <span className="sm:hidden">{t("lesson.nextLesson")}</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="text-white"
              style={{ backgroundColor: "#22c55e" }}
            >
              <Link href={`/${username}/${courseSlug}`}>
                {t("lesson.backToCourse")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
