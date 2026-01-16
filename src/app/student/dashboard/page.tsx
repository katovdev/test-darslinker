"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import { courseAPI, type EnrolledCourse } from "@/lib/api";

export default function StudentDashboardPage() {
  const t = useTranslations();
  const user = useUser();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseAPI.getEnrolledCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      setError(t("course.loadError"));
      console.error("Failed to load enrolled courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  // Calculate stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (c) => c.progress?.isCompleted
  ).length;
  const inProgressCourses = totalCourses - completedCourses;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {t("dashboard.welcomeBack", { name: user?.firstName || "" })}
        </h1>
        <p className="mt-1 text-gray-400">{t("dashboard.continueJourney")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("course.enrolledCourses")}
              </p>
              <p className="text-2xl font-bold text-white">{totalCourses}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("dashboard.activeCourses")}
              </p>
              <p className="text-2xl font-bold text-white">
                {inProgressCourses}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/10 p-3">
              <Award className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("course.completed")}</p>
              <p className="text-2xl font-bold text-white">
                {completedCourses}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {t("course.myCourses")}
          </h2>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href="/student/courses">{t("dashboard.allCourses")}</Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-gray-800 bg-gray-800/30">
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-32 w-full rounded-lg bg-gray-700" />
                  <Skeleton className="mb-2 h-5 w-3/4 bg-gray-700" />
                  <Skeleton className="mb-4 h-4 w-1/2 bg-gray-700" />
                  <Skeleton className="h-2 w-full bg-gray-700" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="border-gray-800 bg-gray-800/30">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="rounded-full bg-red-500/10 p-4">
                <BookOpen className="h-8 w-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {t("blog.errorTitle")}
                </h3>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
              <Button
                onClick={loadCourses}
                variant="outline"
                className="gap-2 border-gray-700 text-white hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && courses.length === 0 && (
          <Card className="border-gray-800 bg-gray-800/30">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="rounded-full bg-gray-800 p-4">
                <BookOpen className="h-8 w-8 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {t("course.noCourses")}
                </h3>
                <p className="text-sm text-gray-400">
                  {t("dashboard.browseAllCourses")}
                </p>
              </div>
              <Button
                asChild
                className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                <Link href="/student/courses">{t("course.browseCourses")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && courses.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course }: { course: EnrolledCourse }) {
  const t = useTranslations();
  const progress = course.progress?.completionPercentage || 0;
  const isCompleted = course.progress?.isCompleted || false;

  // Calculate total lessons
  const totalLessons =
    course.modules?.reduce(
      (sum, module) => sum + (module.lessons?.length || 0),
      0
    ) ||
    course.totalLessons ||
    0;

  return (
    <Link href={`/student/course/${course._id}`}>
      <Card className="h-full border-gray-800 bg-gray-800/30 transition-colors hover:bg-gray-800/50">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-700">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-gray-600" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
              {t("course.completed")}
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-2 text-base text-white">
            {course.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Course Info */}
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {totalLessons} {t("course.lessons")}
            </span>
            {course.totalDuration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.totalDuration}
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">{t("course.progress")}</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-gray-700" />
          </div>

          {/* Action */}
          <Button
            className="w-full bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
            size="sm"
          >
            {progress > 0
              ? t("course.continueLearning")
              : t("course.startCourse")}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
