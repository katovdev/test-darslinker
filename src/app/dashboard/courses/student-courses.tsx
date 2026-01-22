"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Loader2, Search, TrendingUp, Layers } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import Link from "next/link";

export function StudentCoursesView() {
  const t = useTranslations();
  const [enrolledCourses, setEnrolledCourses] = useState<GlobalCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseAPI.getCourses();
      if (response.success) {
        setEnrolledCourses(response.data.enrolled || []);
      } else {
        setError("Failed to load courses");
      }
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = enrolledCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("dashboard.myCourses") || "My Courses"}
        </h1>
        <p className="mt-1 text-gray-400">
          {t("dashboard.myCoursesSubtitle") || "Continue your learning journey"}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("dashboard.searchCourses") || "Search courses..."}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-400">Loading courses...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCourses.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-800/30 p-12">
          <div className="text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              {search
                ? t("dashboard.noCoursesFound") || "No courses found"
                : t("dashboard.noEnrolledCourses") || "No enrolled courses yet"}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {search
                ? t("dashboard.tryDifferentSearch") ||
                  "Try a different search term"
                : t("dashboard.exploreCoursesMessage") ||
                  "Explore available courses to get started"}
            </p>
            {!search && (
              <Link
                href="/courses"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {t("dashboard.browseCourses") || "Browse Courses"}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && filteredCourses.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className="group rounded-lg border border-gray-800 bg-gray-800/50 p-6 backdrop-blur transition-all hover:border-gray-700 hover:bg-gray-800"
            >
              {/* Thumbnail */}
              {course.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="mb-4 h-40 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-gray-700">
                  <BookOpen className="h-12 w-12 text-gray-600" />
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400">
                {course.title}
              </h3>

              {/* Description */}
              {course.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                  {course.description}
                </p>
              )}

              {/* Teacher */}
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <span>
                  {t("dashboard.by") || "By"} {course.teacher.firstName}{" "}
                  {course.teacher.lastName}
                </span>
              </div>

              {/* Stats */}
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  {course.modulesCount} {t("dashboard.modules") || "modules"}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.lessonsCount} {t("dashboard.lessons") || "lessons"}
                </span>
              </div>

              {/* Progress Placeholder */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    {t("dashboard.progress") || "Progress"}
                  </span>
                  <span className="text-gray-400">0%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>

              {/* Continue Learning Button */}
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors group-hover:bg-blue-700">
                  <TrendingUp className="h-4 w-4" />
                  {t("dashboard.continueLearning") || "Continue Learning"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
