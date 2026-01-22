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
  Video,
  Menu,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    router.push(`/dashboard/${username}/${courseSlug}/${lesson.slug}`);
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
          <Link href={`/dashboard/${username}/${courseSlug}`}>
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
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-gray-800 p-2 text-white lg:hidden"
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-80 transform border-r border-gray-800 bg-gray-900 transition-transform duration-300 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Course header */}
          <div className="border-b border-gray-800 p-4">
            <Link
              href={`/dashboard/${username}/${courseSlug}`}
              className="mb-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("course.backToCourse") || "Back to Course"}
            </Link>
            <h2 className="line-clamp-2 font-semibold text-white">
              {course.course.title}
            </h2>
          </div>

          {/* Progress */}
          <div className="border-b border-gray-800 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {t("course.progress") || "Progress"}
              </span>
              <span className="font-medium text-white">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="mt-2 text-xs text-gray-500">
              {completedLessons.size} / {lessons.length}{" "}
              {t("course.lessonsCompleted") || "lessons completed"}
            </p>
          </div>

          {/* Modules & Lessons */}
          <div className="flex-1 overflow-y-auto p-2">
            {course.modules.map((courseModule, moduleIndex) => (
              <div key={courseModule.id} className="mb-4">
                <div className="mb-2 px-2">
                  <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {t("course.module") || "Module"} {moduleIndex + 1}
                  </h3>
                  <p className="text-sm font-medium text-white">
                    {courseModule.title}
                  </p>
                </div>

                <div className="space-y-1">
                  {courseModule.lessons.map((lesson) => {
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = completedLessons.has(lesson.id);
                    const lessonWithModule: LessonWithModule = {
                      ...lesson,
                      moduleId: courseModule.id,
                      moduleTitle: courseModule.title,
                    };

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goToLesson(lessonWithModule)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : isActive
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-800 text-gray-500"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Video className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{lesson.title}</p>
                          {lesson.durationMins > 0 && (
                            <p className="text-xs text-gray-500">
                              {formatDuration(lesson.durationMins)}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:pl-0">
        <div className="flex min-h-screen flex-col">
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
          <div className="flex-1 p-6 lg:p-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {currentLesson.moduleTitle}
                  </p>
                  <h1 className="mt-1 text-2xl font-bold text-white">
                    {currentLesson.title}
                  </h1>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                    {currentLesson.durationMins > 0 && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(currentLesson.durationMins)}
                      </span>
                    )}
                  </div>
                </div>

                {!completedLessons.has(currentLesson.id) && (
                  <Button onClick={markAsComplete} className="shrink-0">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {t("course.markComplete") || "Mark Complete"}
                  </Button>
                )}
              </div>

              {/* Text content */}
              {currentLesson.content && (
                <div className="prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentLesson.content,
                    }}
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-800 pt-6">
                <Button
                  variant="outline"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="border-gray-700"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t("course.previous") || "Previous"}
                </Button>

                <span className="text-sm text-gray-500">
                  {currentIndex + 1} / {lessons.length}
                </span>

                <Button
                  onClick={goToNext}
                  disabled={currentIndex === lessons.length - 1}
                >
                  {t("course.next") || "Next"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
