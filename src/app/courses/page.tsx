"use client";

import { useEffect, useState, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  RefreshCw,
  Clock,
  Users,
  Play,
  User,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { courseAPI, type GlobalCourse } from "@/lib/api";
import { HomeHeader, HomeFooter } from "@/components/home";
import { CourseRatingBadge } from "@/components/course/rating-badge";

type FilterTab = "all" | "enrolled";

// Hoist formatDuration outside component to prevent recreation
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export default function CoursesPage() {
  const t = useTranslations();
  const [courses, setCourses] = useState<GlobalCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<GlobalCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseAPI.getCourses();
      if (response.success && response.data) {
        setCourses(response.data.all);
        setEnrolledCourses(response.data.enrolled);
      } else {
        setError("Failed to load courses");
      }
    } catch (err) {
      setError("Failed to load courses");
      console.error("Failed to load courses:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Memoize enrolled course IDs for O(1) lookup
  const enrolledCourseIds = useMemo(
    () => new Set(enrolledCourses.map((c) => c.id)),
    [enrolledCourses]
  );

  const displayCourses = activeTab === "all" ? courses : enrolledCourses;

  // Memoize filtered courses
  const filteredCourses = useMemo(
    () =>
      displayCourses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [displayCourses, searchQuery]
  );

  // Memoize stats to prevent recalculation on every render
  const stats = useMemo(
    () => ({
      totalCourses: courses.length,
      enrolledCount: enrolledCourses.length,
      teachersCount: new Set(courses.map((c) => c.teacher.id)).size,
      totalDuration: formatDuration(
        courses.reduce((sum, c) => sum + c.totalDuration, 0)
      ),
    }),
    [courses, enrolledCourses]
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      <section className="relative overflow-hidden px-4 pt-24 pb-12 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
          <div className="absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              {t("course.exploreCourses") || "Explore Courses"}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {t("course.allCoursesTitle") || "Discover Amazing Courses"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
              {t("course.allCoursesSubtitle") ||
                "Learn from expert teachers and expand your knowledge"}
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.totalCourses}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("course.totalCourses") || "Total Courses"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.enrolledCount}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("course.enrolledCourses") || "Enrolled"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.teachersCount}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("course.teachers") || "Teachers"}
              </p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-white">
                  {stats.totalDuration}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t("course.totalDuration") || "Total Duration"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-gray-800" />

        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder={t("course.searchCourses") || "Search courses..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pr-4 pl-12 text-white placeholder-gray-500 transition-colors outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              {(["all", "enrolled"] as FilterTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "border border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600 hover:text-white"
                  }`}
                >
                  {tab === "all" && (t("course.allCourses") || "All Courses")}
                  {tab === "enrolled" &&
                    (t("course.myEnrolled") || "My Enrolled")}
                  <span className="ml-1.5 text-xs opacity-70">
                    {tab === "all" && `(${courses.length})`}
                    {tab === "enrolled" && `(${enrolledCourses.length})`}
                  </span>
                </button>
              ))}
            </div>
          </div>

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
                  <div className="h-10 w-full rounded-xl bg-gray-700/50" />
                </div>
              ))}
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <BookOpen className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t("blog.errorTitle") || "Error"}
              </h3>
              <p className="mb-6 text-gray-400">{error}</p>
              <button
                onClick={loadCourses}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                {t("common.retry") || "Retry"}
              </button>
            </div>
          )}

          {!isLoading && !error && filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {activeTab === "enrolled"
                  ? t("course.noEnrolled") || "No enrolled courses"
                  : t("course.noCourses") || "No courses found"}
              </h3>
              <p className="mb-6 text-gray-400">
                {activeTab === "enrolled"
                  ? t("course.noEnrolledDesc") ||
                    "Start learning by enrolling in a course"
                  : t("course.noCoursesDesc") ||
                    "Try adjusting your search or check back later"}
              </p>
              {activeTab === "enrolled" && (
                <button
                  onClick={() => setActiveTab("all")}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
                >
                  {t("course.browseCourses") || "Browse Courses"}
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && filteredCourses.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isEnrolled={enrolledCourseIds.has(course.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <HomeFooter />
    </div>
  );
}

interface CourseCardProps {
  course: GlobalCourse;
  isEnrolled: boolean;
}

// Memoized CourseCard to prevent unnecessary re-renders
const CourseCard = memo(function CourseCard({
  course,
  isEnrolled,
}: CourseCardProps) {
  const t = useTranslations();
  const courseLink = `/teachers/${course.teacher.id}`;

  return (
    <Link href={courseLink} className="group relative block">
      <div className="relative rounded-2xl border border-gray-800 bg-gray-800/30 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />

        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-700/50">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <BookOpen className="h-12 w-12 text-gray-600" />
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            {course.averageRating > 0 && (
              <CourseRatingBadge
                rating={course.averageRating}
                reviewCount={course.totalReviews}
                size="sm"
              />
            )}

            {isEnrolled && (
              <div className="flex items-center gap-1.5 rounded-lg bg-green-500 px-2.5 py-1 text-xs font-medium text-white shadow-lg">
                <CheckCircle className="h-3 w-3" />
                {t("course.enrolled") || "Enrolled"}
              </div>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
            <div className="flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
              <Play className="h-6 w-6 text-white" fill="white" />
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
            {course.title}
          </h3>

          <div className="mb-3 flex items-center gap-2">
            {course.teacher.logoUrl ? (
              <img
                src={course.teacher.logoUrl}
                alt={`${course.teacher.firstName} ${course.teacher.lastName}`}
                className="h-6 w-6 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-700">
                <User className="h-3 w-3 text-gray-400" />
              </div>
            )}
            <span className="text-sm text-gray-500">
              {course.teacher.firstName} {course.teacher.lastName}
            </span>
          </div>

          <div className="mb-4 flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>
                {course.lessonsCount} {t("course.lessons") || "lessons"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.totalDuration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {course.price > 0 ? (
                <span className="text-lg font-bold text-white">
                  {course.price.toLocaleString()}{" "}
                  <span className="text-sm font-normal text-gray-500">UZS</span>
                </span>
              ) : (
                <span className="text-lg font-bold text-green-400">
                  {t("course.free") || "Free"}
                </span>
              )}
            </div>
            <span className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/30">
              {isEnrolled
                ? t("course.continueLearning") || "Continue"
                : t("course.viewCourse") || "View"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
