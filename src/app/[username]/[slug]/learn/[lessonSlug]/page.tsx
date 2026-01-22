"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { VideoPlayer } from "@/components/ui/video-player";
import { courseContentApi } from "@/lib/api/course-content";
import type { CourseContentOverview } from "@/lib/api/course-content";

interface LessonWithModule {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  videoUrl: string | null;
  durationMins: number;
  moduleId: string;
  moduleTitle: string;
}

export default function StudentLessonPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const courseSlug = params.slug as string;
  const lessonSlug = params.lessonSlug as string;

  const t = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseContentOverview | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonWithModule | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );

  // Load course content and find current lesson
  useEffect(() => {
    if (!courseSlug || !lessonSlug || authLoading) return;

    const loadLesson = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load course content
        const response = await courseContentApi.getCourseContent(courseSlug);

        if (response.success) {
          setCourse(response.data);

          // Find the lesson by slug
          let foundLesson: LessonWithModule | null = null;
          for (const courseModule of response.data.modules) {
            const lesson = courseModule.lessons.find(
              (l) => l.slug === lessonSlug
            );
            if (lesson) {
              foundLesson = {
                ...lesson,
                moduleId: courseModule.id,
                moduleTitle: courseModule.title,
              };
              break;
            }
          }

          if (foundLesson) {
            setCurrentLesson(foundLesson);
          } else {
            setError("Lesson not found");
          }

          // TODO: Load user's completed lessons from progress API
          setCompletedLessons(new Set());
        }
      } catch (err) {
        console.error("Failed to load lesson:", err);
        setError(t("course.loadError") || "Failed to load lesson");
      } finally {
        setIsLoading(false);
      }
    };

    loadLesson();
  }, [courseSlug, lessonSlug, authLoading, t]);

  const getAllLessons = useCallback((): LessonWithModule[] => {
    if (!course) return [];
    const lessons: LessonWithModule[] = [];
    for (const courseModule of course.modules) {
      for (const lesson of courseModule.lessons) {
        lessons.push({
          ...lesson,
          moduleId: courseModule.id,
          moduleTitle: courseModule.title,
        });
      }
    }
    return lessons;
  }, [course]);

  const getCurrentIndex = useCallback((): number => {
    const lessons = getAllLessons();
    return lessons.findIndex((l) => l.id === currentLesson?.id);
  }, [getAllLessons, currentLesson]);

  const goToLesson = (lesson: LessonWithModule) => {
    router.push(`/${username}/${courseSlug}/learn/${lesson.slug}`);
  };

  const goToPrevious = () => {
    const lessons = getAllLessons();
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      goToLesson(lessons[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    const lessons = getAllLessons();
    const currentIndex = getCurrentIndex();
    if (currentIndex < lessons.length - 1) {
      goToLesson(lessons[currentIndex + 1]);
    }
  };

  const markAsComplete = async () => {
    if (!currentLesson) return;

    try {
      // TODO: Call progress API to mark lesson as complete
      // await progressAPI.markLessonComplete(course.id, currentLesson.id);

      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]));

      // Auto-advance to next lesson after a short delay
      setTimeout(goToNext, 500);
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const calculateProgress = (): number => {
    const lessons = getAllLessons();
    if (lessons.length === 0) return 0;
    return Math.round((completedLessons.size / lessons.length) * 100);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-400">
            {t("common.loading") || "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  if (user?.role !== "student") {
    router.push("/dashboard");
    return null;
  }

  if (error || !course || !currentLesson) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
        <BookOpen className="mb-4 h-16 w-16 text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          {t("course.notFound") || "Lesson Not Found"}
        </h1>
        <p className="mb-6 text-gray-400">{error}</p>
        <Button asChild>
          <Link href={`/${username}/${courseSlug}/learn`}>
            {t("course.backToCourse") || "Back to Course"}
          </Link>
        </Button>
      </div>
    );
  }

  const currentIndex = getCurrentIndex();
  const lessons = getAllLessons();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with back button */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link
              href={`/${username}/${courseSlug}/learn`}
              className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("course.backToCourse") || "Back to Course"}
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>
                {currentIndex + 1} / {lessons.length}{" "}
                {t("course.lessons") || "lessons"}
              </span>
              {!completedLessons.has(currentLesson.id) && (
                <Button onClick={markAsComplete} size="sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t("course.markComplete") || "Mark Complete"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main>
        <div className="flex min-h-[calc(100vh-4rem)] flex-col">
          {/* Video/Content area */}
          <div className="relative bg-black">
            {currentLesson.videoUrl ? (
              <div className="aspect-video w-full">
                <VideoPlayer
                  src={currentLesson.videoUrl}
                  poster={course.course.thumbnail || undefined}
                  onEnded={markAsComplete}
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-800">
                <div className="text-center">
                  <FileText className="mx-auto h-16 w-16 text-gray-600" />
                  <p className="mt-4 text-gray-400">
                    {t("course.textContent") || "Text content"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson info */}
          <div className="flex-1 bg-gray-900 p-6 lg:p-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  {currentLesson.moduleTitle}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white">
                  {currentLesson.title}
                </h1>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
                  {currentLesson.durationMins > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatDuration(currentLesson.durationMins)}
                    </span>
                  )}
                  {completedLessons.has(currentLesson.id) && (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      {t("lesson.completed") || "Completed"}
                    </span>
                  )}
                </div>
              </div>

              {/* Text content */}
              {currentLesson.content && (
                <div className="prose prose-invert prose-lg max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentLesson.content,
                    }}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="mt-12 flex items-center justify-between border-t border-gray-800 pt-8">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="border-gray-700"
                  size="lg"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" />
                  {t("course.previous") || "Previous"}
                </Button>

                <Link
                  href={`/${username}/${courseSlug}/learn`}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {t("course.viewAllLessons") || "View All Lessons"}
                </Link>

                <Button
                  onClick={goToNext}
                  disabled={currentIndex === lessons.length - 1}
                  size="lg"
                >
                  {t("course.next") || "Next"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
