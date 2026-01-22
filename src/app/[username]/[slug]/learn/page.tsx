"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  CheckCircle,
  Clock,
  PlayCircle,
  FileText,
  Lock,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { courseContentApi } from "@/lib/api/course-content";
import type { CourseContentOverview } from "@/lib/api/course-content";

interface CourseProgress {
  completedLessons: string[];
  progress: number;
}

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const slug = params.slug as string;

  const t = useTranslations();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseContentOverview | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  // Load course content
  useEffect(() => {
    if (!slug || authLoading) return;

    const loadCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: We need to get courseId from slug first
        // For now, assuming slug is courseId
        const response = await courseContentApi.getCourseContent(slug);

        if (response.success) {
          setCourse(response.data);
          // Expand all modules by default
          const moduleIds = response.data.modules.map((m) => m.id);
          setExpandedModules(new Set(moduleIds));

          // Load progress if authenticated
          if (isAuthenticated) {
            // TODO: Load user's progress for this course
            setCourseProgress({
              completedLessons: [],
              progress: 0,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        setError(t("course.loadError") || "Failed to load course content");
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [slug, authLoading, isAuthenticated, t]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return courseProgress?.completedLessons.includes(lessonId) || false;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "";
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <BookOpen className="mb-4 h-16 w-16 text-gray-600" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          {t("course.notFound") || "Course Not Found"}
        </h1>
        <p className="mb-6 text-gray-400">{error}</p>
        <Button asChild>
          <Link href="/dashboard/courses">
            {t("course.browseCourses") || "Back to Courses"}
          </Link>
        </Button>
      </div>
    );
  }

  const totalLessons =
    course.modules.reduce((sum, m) => sum + m.lessons.length, 0) || 1;
  const completedCount = courseProgress?.completedLessons.length || 0;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${username}/${slug}`}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
            {t("course.backToCourse") || "Back to Course"}
          </Link>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">
                {course.course.title}
              </h1>
              <p className="mt-2 text-gray-400">{course.course.description}</p>

              {/* Stats */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.stats.modulesCount} {t("course.modules") || "modules"}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {course.stats.lessonsCount} {t("course.lessons") || "lessons"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.stats.totalDuration)}
                </span>
              </div>
            </div>

            {/* Progress Card */}
            <div className="w-full rounded-lg border border-gray-800 bg-gray-800/50 p-6 lg:w-80">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  {t("course.yourProgress") || "Your Progress"}
                </span>
                <span className="text-lg font-bold text-white">
                  {progressPercent}%
                </span>
              </div>
              <Progress value={progressPercent} className="mb-2 h-2" />
              <p className="text-xs text-gray-500">
                {completedCount} / {totalLessons}{" "}
                {t("course.lessonsCompleted") || "lessons completed"}
              </p>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            {t("course.courseContent") || "Course Content"}
          </h2>

          {course.modules.map((courseModule, moduleIndex) => {
            const isExpanded = expandedModules.has(courseModule.id);
            const moduleCompleted = courseModule.lessons.every((l) =>
              isLessonCompleted(l.id)
            );

            return (
              <div
                key={courseModule.id}
                className="overflow-hidden rounded-lg border border-gray-800 bg-gray-800/30"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(courseModule.id)}
                  className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                        {t("course.module") || "Module"} {moduleIndex + 1}
                      </span>
                      {moduleCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {courseModule.title}
                    </h3>
                    {courseModule.description && (
                      <p className="mt-1 text-sm text-gray-400">
                        {courseModule.description}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      {courseModule.lessons.length}{" "}
                      {t("course.lessons") || "lessons"} •{" "}
                      {formatDuration(
                        courseModule.lessons.reduce(
                          (sum, l) => sum + (l.durationMins || 0),
                          0
                        )
                      )}
                    </p>
                  </div>

                  <ChevronLeft
                    className={cn(
                      "h-5 w-5 text-gray-400 transition-transform",
                      isExpanded && "-rotate-90"
                    )}
                  />
                </button>

                {/* Lessons List */}
                {isExpanded && (
                  <div className="border-t border-gray-800 bg-gray-900/50">
                    {courseModule.lessons.map((lesson, lessonIndex) => {
                      const isCompleted = isLessonCompleted(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/${username}/${slug}/learn/${lesson.slug}`}
                          className="flex items-center gap-4 border-b border-gray-800 p-4 transition-colors last:border-b-0 hover:bg-gray-800/50"
                        >
                          {/* Lesson Number/Status */}
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                              isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : "bg-gray-700 text-gray-400"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              lessonIndex + 1
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-white">
                              {lesson.title}
                            </p>
                            {lesson.durationMins && (
                              <p className="text-xs text-gray-500">
                                {formatDuration(lesson.durationMins)}
                              </p>
                            )}
                          </div>

                          {/* Play Icon */}
                          <PlayCircle className="h-5 w-5 shrink-0 text-gray-400" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
