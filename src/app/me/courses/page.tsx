"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Play,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader, RefreshButton } from "@/components/ui/page-header";
import { SkeletonGrid } from "@/components/ui/skeleton-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDuration } from "@/lib/formatting";

interface EnrolledCourse extends GlobalCourse {
  progress?: number;
  completedLessons?: number;
  lastAccessedAt?: string;
}

export default function MyCoursesPage() {
  const t = useTranslations();
  const { isAuthenticated } = useAuth();

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseAPI.getCourses();
      if (response.success && response.data) {
        setCourses(response.data.enrolled || []);
      } else {
        setError(t("course.loadError") || "Failed to load courses");
      }
    } catch {
      setError(t("course.loadError") || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCourses();
    }
  }, [isAuthenticated]);

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    return "bg-yellow-500";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("dashboard.myCourses") || "My Courses"}
        subtitle={
          t("dashboard.continueJourney") || "Continue your learning journey"
        }
      >
        <RefreshButton
          onClick={loadCourses}
          isLoading={isLoading}
          label={t("common.refresh") || "Refresh"}
        />
      </PageHeader>

      {isLoading ? (
        <SkeletonGrid count={4} columns={2} />
      ) : error ? (
        <EmptyState
          variant="error"
          title={t("common.error") || "Error"}
          description={error}
          action={
            <Button onClick={loadCourses}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("common.retry") || "Retry"}
            </Button>
          }
        />
      ) : courses.length === 0 ? (
        <EmptyState
          variant="no-data"
          title={t("course.noEnrolledCourses") || "No courses yet"}
          description={
            t("course.enrollFirst") ||
            "Browse courses and start learning today!"
          }
          action={
            <Button asChild>
              <Link href="/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                {t("course.browseCourses") || "Browse Courses"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((course) => {
            const progress = course.progress || 0;
            const isCompleted = progress >= 100;

            return (
              <div
                key={course.id}
                className="group rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-colors hover:border-gray-700"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-700">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen className="h-8 w-8 text-gray-500" />
                      </div>
                    )}
                    {isCompleted && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/20">
                        <CheckCircle className="h-8 w-8 text-green-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 line-clamp-2 font-semibold text-white group-hover:text-green-400">
                      {course.title}
                    </h3>
                    <p className="mb-2 text-sm text-gray-400">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {course.lessonsCount} {t("course.lessons") || "lessons"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDuration(course.totalDuration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {isCompleted
                        ? t("course.completed") || "Completed"
                        : `${progress}% ${t("course.complete") || "complete"}`}
                    </span>
                    {course.completedLessons !== undefined && (
                      <span className="text-gray-500">
                        {course.completedLessons}/{course.lessonsCount}
                      </span>
                    )}
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center justify-between">
                  <Link
                    href={`/learn/${course.id}`}
                    className="flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300"
                  >
                    {isCompleted ? (
                      <>
                        <Play className="h-4 w-4" />
                        {t("course.reviewCourse") || "Review Course"}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {t("course.continueLearning") || "Continue Learning"}
                      </>
                    )}
                  </Link>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    {t("course.viewDetails") || "View Details"}
                    <ArrowRight className="ml-1 inline h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
