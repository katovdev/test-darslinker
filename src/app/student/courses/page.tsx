"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  RefreshCw,
  Clock,
  Award,
  TrendingUp,
  Play,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { studentAPI, type Enrollment } from "@/lib/api";

type FilterStatus = "all" | "active" | "completed";

export default function StudentCoursesPage() {
  const t = useTranslations();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

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

  // Filter enrollments
  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.course.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || enrollment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = enrollments.filter((e) => e.status === "active").length;
  const completedCount = enrollments.filter(
    (e) => e.status === "completed"
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
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              {t("course.myCourses")}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              {t("course.enrolledCourses")}
            </h1>
            <p className="mt-2 text-gray-400">
              {t("dashboard.continueJourney")}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-all hover:border-gray-700 hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {enrollments.length}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("course.enrolledCourses")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-all hover:border-gray-700 hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{activeCount}</p>
                  <p className="text-xs text-gray-500">
                    {t("course.inProgress")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-all hover:border-gray-700 hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Award className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {completedCount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("course.completed")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-all hover:border-gray-700 hover:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {averageProgress}%
                  </p>
                  <p className="text-xs text-gray-500">{t("course.progress")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-gray-800" />

        <div className="mx-auto max-w-6xl">
          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t("course.searchCourses")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "active", "completed"] as FilterStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                      statusFilter === status
                        ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                        : "border border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white"
                    }`}
                  >
                    {status === "all" && t("course.allCourses")}
                    {status === "active" && t("course.inProgress")}
                    {status === "completed" && t("course.completed")}
                    <span className="ml-1.5 text-xs opacity-70">
                      {status === "all" && `(${enrollments.length})`}
                      {status === "active" && `(${activeCount})`}
                      {status === "completed" && `(${completedCount})`}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-gray-800 bg-gray-800/30 p-4"
                >
                  <div className="mb-4 aspect-video rounded-xl bg-gray-700/50" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-gray-700/50" />
                  <div className="mb-4 h-3 w-1/2 rounded bg-gray-700/30" />
                  <div className="h-2 w-full rounded-full bg-gray-700/50" />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <BookOpen className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="mb-6 text-gray-400">{error}</p>
              <button
                onClick={loadEnrollments}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                {t("common.retry")}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && enrollments.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t("course.noCourses")}
              </h3>
              <p className="mb-6 text-gray-400">{t("course.noCoursesDesc")}</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading &&
            !error &&
            enrollments.length > 0 &&
            filteredEnrollments.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-700/50">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {t("course.noResults")}
                </h3>
                <p className="mb-6 text-gray-400">
                  {t("course.tryDifferentSearch")}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-700"
                >
                  {t("course.clearFilters")}
                </button>
              </div>
            )}

          {/* Courses Grid */}
          {!isLoading && !error && filteredEnrollments.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEnrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} enrollment={enrollment} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const t = useTranslations();
  const progress = enrollment.progress?.percentage || 0;
  const isCompleted = enrollment.status === "completed";
  const course = enrollment.course;

  return (
    <Link
      href={`/student/course/${enrollment.courseId}`}
      className="group relative block"
    >
      <div className="relative rounded-2xl border border-gray-800 bg-gray-800/30 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50">
        {/* Gradient hover effect */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-700/50">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <BookOpen className="h-12 w-12 text-gray-600" />
            </div>
          )}

          {/* Status Badge */}
          {isCompleted && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-green-500 px-2.5 py-1 text-xs font-medium text-white shadow-lg">
              <Award className="h-3 w-3" />
              {t("course.completed")}
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
              <Play className="h-6 w-6 text-white" fill="white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
            {course.title}
          </h3>

          <p className="mb-4 text-sm text-gray-500">
            {course.teacher.firstName} {course.teacher.lastName}
          </p>

          {/* Progress */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                {enrollment.progress?.completedLessons || 0}/
                {enrollment.progress?.totalLessons || 0} {t("course.lessons")}
              </span>
              <span className="font-medium text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30">
            {progress > 0
              ? t("course.continueLearning")
              : t("course.startCourse")}
          </button>
        </div>
      </div>
    </Link>
  );
}
