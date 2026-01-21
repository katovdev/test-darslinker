"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  HelpCircle,
  Video,
  Menu,
  X,
  Home,
  Clock,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { VideoPlayer } from "@/components/ui/video-player";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "quiz" | "assignment";
  duration?: number;
  videoUrl?: string;
  content?: string;
  isCompleted?: boolean;
  isFree?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  order: number;
}

interface CourseContent {
  id: string;
  title: string;
  thumbnail?: string;
  modules: Module[];
  progress: number;
  teacher: {
    firstName: string;
    lastName: string;
  };
}

export default function LearnPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = searchParams.get("lesson");

  const t = useTranslations();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseContent | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set()
  );

  // Fetch course content
  useEffect(() => {
    if (!courseId || authLoading) return;

    const loadCourse = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api"}/course-content/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to load course");
        }

        const data = await response.json();
        if (data.success) {
          setCourse(data.data);

          // Set initial lesson
          if (data.data.modules?.length > 0) {
            const firstModule = data.data.modules[0];
            if (firstModule.lessons?.length > 0) {
              const targetLesson = lessonId
                ? findLessonById(data.data.modules, lessonId)
                : firstModule.lessons[0];
              setCurrentLesson(targetLesson || firstModule.lessons[0]);
            }
          }
        }
      } catch (err) {
        setError(t("course.loadError") || "Failed to load course content");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [courseId, authLoading, lessonId, router, t]);

  const findLessonById = (modules: Module[], id: string): Lesson | null => {
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => l.id === id);
      if (lesson) return lesson;
    }
    return null;
  };

  const getAllLessons = useCallback((): Lesson[] => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons);
  }, [course]);

  const getCurrentIndex = useCallback((): number => {
    const lessons = getAllLessons();
    return lessons.findIndex((l) => l.id === currentLesson?.id);
  }, [getAllLessons, currentLesson]);

  const goToLesson = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    router.push(`/learn/${courseId}?lesson=${lesson.id}`, { scroll: false });
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
      const token = localStorage.getItem("accessToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api"}/progress/${courseId}/lessons/${currentLesson.id}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]));

      // Auto-advance to next lesson
      setTimeout(goToNext, 500);
    } catch (err) {
      console.error("Failed to mark lesson complete:", err);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return Video;
      case "quiz":
        return HelpCircle;
      case "assignment":
        return FileText;
      default:
        return FileText;
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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
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

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
        <BookOpen className="mb-4 h-16 w-16 text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          {t("course.notFound") || "Course Not Found"}
        </h1>
        <p className="mb-6 text-gray-400">{error}</p>
        <Button asChild>
          <Link href="/courses">
            <Home className="mr-2 h-4 w-4" />
            {t("course.browseCourses") || "Browse Courses"}
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
              href={`/courses/${course.id}`}
              className="mb-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("course.backToCourse") || "Back to Course"}
            </Link>
            <h2 className="line-clamp-2 font-semibold text-white">
              {course.title}
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              {course.teacher.firstName} {course.teacher.lastName}
            </p>
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
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="mb-4">
                <div className="mb-2 px-2">
                  <h3 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                    {t("course.module") || "Module"} {moduleIndex + 1}
                  </h3>
                  <p className="text-sm font-medium text-white">
                    {module.title}
                  </p>
                </div>

                <div className="space-y-1">
                  {module.lessons.map((lesson) => {
                    const LessonIcon = getLessonIcon(lesson.type);
                    const isActive = currentLesson?.id === lesson.id;
                    const isCompleted = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => goToLesson(lesson)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-green-500/10 text-green-400"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : isActive
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-800 text-gray-500"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <LessonIcon className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate">{lesson.title}</p>
                          {lesson.duration && (
                            <p className="text-xs text-gray-500">
                              {formatDuration(lesson.duration)}
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
        {currentLesson ? (
          <div className="flex min-h-screen flex-col">
            {/* Video/Content area */}
            <div className="relative bg-black">
              {currentLesson.type === "video" && currentLesson.videoUrl ? (
                <div className="aspect-video w-full">
                  <VideoPlayer
                    src={currentLesson.videoUrl}
                    poster={course.thumbnail}
                    onEnded={markAsComplete}
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <FileText className="mx-auto h-16 w-16 text-gray-600" />
                    <p className="mt-4 text-gray-400">
                      {currentLesson.type === "quiz"
                        ? t("course.quizContent") || "Quiz content"
                        : t("course.textContent") || "Text content"}
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
                    <h1 className="text-2xl font-bold text-white">
                      {currentLesson.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                      {currentLesson.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(currentLesson.duration)}
                        </span>
                      )}
                      <span className="capitalize">{currentLesson.type}</span>
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
        ) : (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <BookOpen className="mx-auto h-16 w-16 text-gray-600" />
              <p className="mt-4 text-gray-400">
                {t("course.selectLesson") ||
                  "Select a lesson to start learning"}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
