"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  User,
  Play,
  FileText,
  HelpCircle,
  File,
  ChevronDown,
  Lock,
  CheckCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslations } from "@/hooks/use-locale";
import {
  courseAPI,
  type Course,
  type Module,
  type Lesson,
  type CourseProgress,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const lessonIcons: Record<string, typeof Play> = {
  video: Play,
  quiz: HelpCircle,
  assignment: FileText,
  file: File,
  reading: FileText,
};

export default function CourseDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const loadCourse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [courseRes, progressRes] = await Promise.all([
        courseAPI.getCourseById(courseId),
        courseAPI.getCourseProgress(courseId).catch(() => null),
      ]);

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);

        // Auto-expand first module or module with current lesson
        if (courseRes.data.modules?.length > 0) {
          const firstModuleId = courseRes.data.modules[0]._id;
          setExpandedModules([firstModuleId]);
        }
      } else {
        setError(t("course.courseNotFound"));
      }

      if (progressRes?.success && progressRes.data) {
        setProgress(progressRes.data);
      }
    } catch (err) {
      setError(t("course.loadError"));
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

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  const getFirstLesson = (): Lesson | null => {
    if (!course?.modules?.length) return null;
    const firstModule = course.modules[0];
    if (!firstModule.lessons?.length) return null;
    return firstModule.lessons[0];
  };

  const getCurrentLesson = (): Lesson | null => {
    if (progress?.currentLesson && course?.modules) {
      for (const mod of course.modules) {
        const lesson = mod.lessons?.find(
          (l) => l._id === progress.currentLesson
        );
        if (lesson) return lesson;
      }
    }
    return getFirstLesson();
  };

  // Calculate stats
  const totalLessons =
    course?.modules?.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0
    ) || 0;

  const completedLessonsCount = progress?.completedLessons?.length || 0;
  const progressPercentage = progress?.completionPercentage || 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl bg-gray-700" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 w-full rounded-lg bg-gray-700"
              />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg bg-gray-700" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full bg-red-500/10 p-4">
          <BookOpen className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {t("blog.errorTitle")}
          </h3>
          <p className="text-sm text-gray-400">
            {error || t("course.courseNotFound")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadCourse}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
          <Button
            onClick={() => router.push("/student/dashboard")}
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            {t("lesson.backToCourse")}
          </Button>
        </div>
      </div>
    );
  }

  const currentLesson = getCurrentLesson();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <Link href="/student/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("common.back")}
        </Link>
      </Button>

      {/* Course Hero */}
      <Card className="overflow-hidden border-gray-800 bg-gray-800/30">
        <div className="relative aspect-video max-h-64 overflow-hidden bg-gray-700 md:aspect-auto md:h-64">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-gray-600" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-6">
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-2 line-clamp-2 text-gray-300">
                {course.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Modules List */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-xl font-semibold text-white">
            {t("course.modules")}
          </h2>

          {course.modules?.map((module, moduleIndex) => (
            <ModuleCard
              key={module._id}
              module={module}
              moduleIndex={moduleIndex}
              courseId={courseId}
              isExpanded={expandedModules.includes(module._id)}
              onToggle={() => toggleModule(module._id)}
              isLessonCompleted={isLessonCompleted}
            />
          ))}

          {(!course.modules || course.modules.length === 0) && (
            <Card className="border-gray-800 bg-gray-800/30">
              <CardContent className="py-8 text-center">
                <p className="text-gray-400">{t("course.noCourses")}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Progress Card */}
          <Card className="border-gray-800 bg-gray-800/30">
            <CardHeader>
              <CardTitle className="text-white">
                {t("course.progress")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  {Math.round(progressPercentage)}%
                </p>
                <p className="text-sm text-gray-400">
                  {completedLessonsCount} / {totalLessons} {t("course.lessons")}
                </p>
              </div>
              <Progress
                value={progressPercentage}
                className="h-3 bg-gray-700"
              />

              {currentLesson && (
                <Button
                  asChild
                  className="w-full bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
                >
                  <Link
                    href={`/student/course/${courseId}/lesson/${currentLesson._id}`}
                  >
                    {progressPercentage > 0
                      ? t("course.continueLearning")
                      : t("course.startCourse")}
                  </Link>
                </Button>
              )}
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

              {course.totalDuration && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-500/10 p-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("course.duration")}
                    </p>
                    <p className="font-medium text-white">
                      {course.totalDuration}
                    </p>
                  </div>
                </div>
              )}

              {course.teacher && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      {t("course.teacher")}
                    </p>
                    <p className="font-medium text-white">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface ModuleCardProps {
  module: Module;
  moduleIndex: number;
  courseId: string;
  isExpanded: boolean;
  onToggle: () => void;
  isLessonCompleted: (lessonId: string) => boolean;
}

function ModuleCard({
  module,
  moduleIndex,
  courseId,
  isExpanded,
  onToggle,
  isLessonCompleted,
}: ModuleCardProps) {
  const t = useTranslations();
  const completedCount =
    module.lessons?.filter((l) => isLessonCompleted(l._id)).length || 0;
  const totalCount = module.lessons?.length || 0;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="border-gray-800 bg-gray-800/30">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer transition-colors hover:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7EA2D4]/10 text-sm font-medium text-[#7EA2D4]">
                  {moduleIndex + 1}
                </span>
                <div>
                  <CardTitle className="text-base text-white">
                    {module.title}
                  </CardTitle>
                  <p className="text-sm text-gray-400">
                    {completedCount} / {totalCount} {t("course.lessons")}
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
                const completed = isLessonCompleted(lesson._id);
                const locked = lesson.isLocked;

                return (
                  <Link
                    key={lesson._id}
                    href={
                      locked
                        ? "#"
                        : `/student/course/${courseId}/lesson/${lesson._id}`
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-lg p-3 transition-colors",
                      locked
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-gray-800/50",
                      completed && "bg-green-500/5"
                    )}
                    onClick={(e) => locked && e.preventDefault()}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        completed
                          ? "bg-green-500/10 text-green-400"
                          : "bg-gray-800 text-gray-400"
                      )}
                    >
                      {completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm",
                          completed ? "text-green-400" : "text-white"
                        )}
                      >
                        {lessonIndex + 1}. {lesson.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Badge
                          variant="outline"
                          className="border-gray-700 text-gray-400"
                        >
                          {t(`lesson.${lesson.type}`)}
                        </Badge>
                        {lesson.duration && <span>{lesson.duration}</span>}
                      </div>
                    </div>

                    {locked && (
                      <Badge
                        variant="outline"
                        className="border-gray-700 text-gray-500"
                      >
                        {t("course.locked")}
                      </Badge>
                    )}
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
