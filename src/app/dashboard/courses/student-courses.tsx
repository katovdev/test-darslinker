"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Loader2,
  Search,
  TrendingUp,
  Layers,
  Star,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import Link from "next/link";

export function StudentCoursesView() {
  const t = useTranslations();
  const [enrolledCourses, setEnrolledCourses] = useState<GlobalCourse[]>([]);
  const [allCourses, setAllCourses] = useState<GlobalCourse[]>([]);
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
        setAllCourses(response.data.all || []);
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

  // Filter enrolled courses by search
  const filteredEnrolledCourses = enrolledCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  // Filter available courses (not enrolled) by search
  const enrolledIds = new Set(enrolledCourses.map((c) => c.id));
  const availableCourses = allCourses.filter(
    (course) => !enrolledIds.has(course.id)
  );
  const filteredAvailableCourses = availableCourses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("dashboard.courses") || "Courses"}
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

      {!isLoading && !error && (
        <>
          {/* My Courses Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t("dashboard.myCourses") || "My Courses"}
            </h2>

            {filteredEnrolledCourses.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-800/30 p-12">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {search
                      ? t("dashboard.noCoursesFound") || "No courses found"
                      : t("dashboard.noEnrolledCourses") ||
                        "No enrolled courses yet"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {search
                      ? t("dashboard.tryDifferentSearch") ||
                        "Try a different search term"
                      : t("dashboard.exploreCoursesMessage") ||
                        "Explore available courses below to get started"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredEnrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={true}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Available Courses Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-white">
              {t("dashboard.availableCourses") || "Courses"}
            </h2>

            {filteredAvailableCourses.length === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-800/30 p-12">
                <div className="text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {search
                      ? t("dashboard.noCoursesFound") || "No courses found"
                      : t("dashboard.noMoreCourses") ||
                        "No more courses available"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    {search
                      ? t("dashboard.tryDifferentSearch") ||
                        "Try a different search term"
                      : t("dashboard.checkBackLater") ||
                        "Check back later for new courses"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={false}
                    t={t}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Course Card Component
function CourseCard({
  course,
  isEnrolled,
  t,
  formatCurrency,
}: {
  course: GlobalCourse;
  isEnrolled: boolean;
  t: (key: string) => string;
  formatCurrency: (amount: number) => string;
}) {
  const href = isEnrolled
    ? `/dashboard/${course.teacher.username}/${course.slug}`
    : `/${course.teacher.username}/${course.slug}`;

  return (
    <Link
      href={href}
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
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Layers className="h-4 w-4" />
          {course.modulesCount} {t("dashboard.modules") || "modules"}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {course.lessonsCount} {t("dashboard.lessons") || "lessons"}
        </span>
        {course.averageRating > 0 && (
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {course.averageRating.toFixed(1)}
          </span>
        )}
      </div>

      {isEnrolled ? (
        <>
          {/* Progress */}
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
        </>
      ) : (
        <>
          {/* Price */}
          <div className="mt-4">
            {course.type === "free" || course.price === 0 ? (
              <div className="text-lg font-bold text-green-400">
                {t("course.free") || "Free"}
              </div>
            ) : (
              <div className="text-lg font-bold text-white">
                {formatCurrency(course.price)}
              </div>
            )}
          </div>

          {/* Enroll Button */}
          <div className="mt-4">
            <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-blue-600 py-2 text-sm font-medium text-blue-400 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <BookOpen className="h-4 w-4" />
              {course.type === "free" || course.price === 0
                ? t("course.startLearning") || "Start Learning"
                : t("course.enroll") || "Enroll Now"}
            </div>
          </div>
        </>
      )}
    </Link>
  );
}
