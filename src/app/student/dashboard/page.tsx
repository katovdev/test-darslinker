"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Clock, Award, RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import { studentAPI, type Enrollment } from "@/lib/api";

export default function StudentDashboardPage() {
  const t = useTranslations();
  const user = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEnrollments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await studentAPI.getEnrollments();
      if (response.success && response.data) {
        setEnrollments(response.data);
      }
    } catch (err) {
      setError(t("course.loadError"));
      console.error("Failed to load enrollments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter(
    (e) => e.status === "completed"
  ).length;
  const inProgressCourses = enrollments.filter(
    (e) => e.status === "active"
  ).length;
  const averageProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, e) => sum + (e.progress?.percentage || 0),
            0
          ) / enrollments.length
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          {t("dashboard.welcomeBack")
            .replace("{name}", user?.firstName || "")
            .replace("{{name}}", user?.firstName || "")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("dashboard.continueJourney")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("course.enrolledCourses")}
                </p>
                <p className="text-xl font-semibold">{totalCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.activeCourses")}
                </p>
                <p className="text-xl font-semibold">{inProgressCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("course.completed")}
                </p>
                <p className="text-xl font-semibold">{completedCourses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-secondary p-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {t("course.progress")}
                </p>
                <p className="text-xl font-semibold">{averageProgress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("course.myCourses")}</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/student/courses">{t("dashboard.allCourses")}</Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-3 aspect-video w-full rounded-md" />
                  <Skeleton className="mb-2 h-4 w-3/4" />
                  <Skeleton className="mb-3 h-3 w-1/2" />
                  <Skeleton className="h-1 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="rounded-md bg-destructive/10 p-3">
                <BookOpen className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t("blog.errorTitle")}</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button onClick={loadEnrollments} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("common.retry")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && enrollments.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="rounded-md bg-secondary p-3">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold">{t("course.noCourses")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.browseAllCourses")}
                </p>
              </div>
              <Button asChild>
                <Link href="/student/courses">{t("course.browseCourses")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        {!isLoading && !error && enrollments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.slice(0, 6).map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const t = useTranslations();
  const progress = enrollment.progress?.percentage || 0;
  const isCompleted = enrollment.status === "completed";
  const course = enrollment.course;

  return (
    <Link href={`/student/course/${enrollment.courseId}`}>
      <Card className="h-full transition-colors hover:bg-secondary/50">
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-secondary">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute top-2 right-2 rounded-md bg-success px-2 py-0.5 text-xs font-medium text-white">
              {t("course.completed")}
            </div>
          )}
        </div>

        <CardHeader className="p-4 pb-2">
          <CardTitle className="line-clamp-2 text-sm font-semibold">
            {course.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          {/* Teacher Info */}
          <p className="text-xs text-muted-foreground">
            {course.teacher.firstName} {course.teacher.lastName}
          </p>

          {/* Course Stats */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            <span>
              {enrollment.progress?.completedLessons || 0}/
              {enrollment.progress?.totalLessons || 0} {t("course.lessons")}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{t("course.progress")}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {/* Action */}
          <Button className="w-full" size="sm">
            {progress > 0
              ? t("course.continueLearning")
              : t("course.startCourse")}
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
}
