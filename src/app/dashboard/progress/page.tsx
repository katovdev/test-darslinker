"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTranslations } from "@/hooks/use-locale";
import {
  BookOpen,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import Link from "next/link";

type FilterType = "all" | "in-progress" | "completed";

export default function ProgressPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const [enrolledCourses, setEnrolledCourses] = useState<GlobalCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const response = await courseAPI.getCourses();
        if (response.success) {
          setEnrolledCourses(response.data.enrolled || []);
        }
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  // TODO: When backend provides progress data, filter based on actual progress
  const filteredCourses = enrolledCourses.filter((course) => {
    if (filter === "in-progress") return true; // Assume all are in progress
    if (filter === "completed") return false; // None completed yet
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("dashboard.progress") || "My Progress"}
        </h1>
        <p className="mt-1 text-gray-400">
          {t("dashboard.progressSubtitle") || "Track your learning journey"}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t("dashboard.all") || "All"}
          </span>
        </button>
        <button
          onClick={() => setFilter("in-progress")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "in-progress"
              ? "bg-blue-600 text-white"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t("dashboard.inProgress") || "In Progress"}
          </span>
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            filter === "completed"
              ? "bg-blue-600 text-white"
              : "border border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("dashboard.completed") || "Completed"}
          </span>
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-gray-400">
              {t("common.loading") || "Loading..."}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredCourses.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-800 bg-gray-800/30 p-12">
          <div className="text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              {t("dashboard.noProgress") || "No progress to show"}
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {t("dashboard.startLearningMessage") ||
                "Enroll in courses to start tracking your progress"}
            </p>
            <Link
              href="/courses"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t("dashboard.browseCourses") || "Browse Courses"}
            </Link>
          </div>
        </div>
      )}

      {/* Course Progress List */}
      {!isLoading && filteredCourses.length > 0 && (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Link
              key={course.id}
              href={`/learn/${course.id}`}
              className="block rounded-lg border border-gray-800 bg-gray-800/50 p-6 backdrop-blur transition-all hover:border-gray-700 hover:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {t("dashboard.by") || "By"} {course.teacher.firstName}{" "}
                    {course.teacher.lastName}
                  </p>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonsCount}{" "}
                      {t("dashboard.lessons") || "lessons"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(course.totalDuration / 60)}{" "}
                      {t("dashboard.minutes") || "min"}
                    </span>
                  </div>

                  {/* Progress Bar - TODO: Replace with real progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {t("dashboard.progress") || "Progress"}
                      </span>
                      <span className="font-medium text-blue-400">0%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-700">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                        style={{ width: "0%" }}
                      />
                    </div>
                  </div>

                  {/* Module Progress - Coming Soon */}
                  <div className="mt-4 text-xs text-gray-500">
                    {t("dashboard.detailedProgressComingSoon") ||
                      "Detailed module and lesson progress tracking coming soon"}
                  </div>
                </div>

                <ChevronRight className="ml-4 h-5 w-5 flex-shrink-0 text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Note about backend integration */}
      <div className="rounded-lg border border-yellow-900/50 bg-yellow-900/10 p-4">
        <p className="text-sm text-yellow-400">
          <strong>{t("dashboard.note") || "Note"}:</strong>{" "}
          {t("dashboard.progressTrackingNote") ||
            "Progress tracking requires backend API integration. Currently showing enrolled courses only."}
        </p>
      </div>
    </div>
  );
}
