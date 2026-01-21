"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { toast } from "sonner";
import { teacherService } from "@/services/teacher";
import type {
  TeacherStudent,
  TeacherCourse,
  Pagination,
} from "@/lib/api/teacher";

export default function TeacherStudentsPage() {
  const t = useTranslations();
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");

  // Memoized load students function
  const loadStudents = useCallback(
    async (currentPage: number, currentSearch: string, courseId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await teacherService.listStudents({
          page: currentPage,
          limit: 20,
          courseId: courseId || undefined,
          search: currentSearch || undefined,
        });

        if (data) {
          setStudents(data.students);
          setPagination(data.pagination);
        } else {
          const errorMsg =
            t("teacher.studentsLoadError") || "Failed to load students";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch {
        const errorMsg =
          t("teacher.studentsLoadError") || "Failed to load students";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [t]
  );

  // Initial load: fetch courses and students in parallel
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);

      // Parallel fetch courses and students
      const [coursesResult, studentsResult] = await Promise.allSettled([
        teacherService.listCourses({ limit: 100 }),
        teacherService.listStudents({ page: 1, limit: 20 }),
      ]);

      // Handle courses result
      if (coursesResult.status === "fulfilled" && coursesResult.value) {
        setCourses(coursesResult.value.courses);
      }

      // Handle students result
      if (studentsResult.status === "fulfilled" && studentsResult.value) {
        setStudents(studentsResult.value.students);
        setPagination(studentsResult.value.pagination);
      } else {
        const errorMsg =
          t("teacher.studentsLoadError") || "Failed to load students";
        setError(errorMsg);
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, [t]);

  // Reload students when filters change (skip initial load)
  useEffect(() => {
    // Skip if this is the initial load (page 1, no search, no course filter)
    if (page === 1 && !search && !selectedCourse) return;

    loadStudents(page, search, selectedCourse);
  }, [page, search, selectedCourse, loadStudents]);

  const handleRefresh = useCallback(() => {
    loadStudents(page, search, selectedCourse);
  }, [page, search, selectedCourse, loadStudents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("teacher.studentsTitle") || "My Students"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("teacher.studentsSubtitle") ||
              "Students enrolled in your courses"}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={
                t("teacher.searchStudents") || "Search by name or phone..."
              }
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            {t("common.search") || "Search"}
          </button>
        </form>

        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          <option value="">{t("teacher.allCourses") || "All Courses"}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-4"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-700/50" />
                  <div className="h-3 w-24 rounded bg-gray-700/50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && students.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">
            {t("teacher.noStudents") || "No students found"}
          </p>
        </div>
      )}

      {!isLoading && students.length > 0 && (
        <div className="space-y-4">
          {students.map((enrollment) => (
            <div
              key={enrollment.id}
              className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 transition-colors hover:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                  {enrollment.student.avatar ? (
                    <img
                      src={enrollment.student.avatar}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-emerald-400">
                      {enrollment.student.firstName[0]}
                      {enrollment.student.lastName[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </p>
                  <p className="text-sm text-gray-400">
                    {enrollment.student.phone}
                    {enrollment.student.username && (
                      <span className="ml-2">
                        @{enrollment.student.username}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <BookOpen className="h-4 w-4" />
                    {enrollment.course.title}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    {enrollment.completedAt ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                        {t("teacher.completed") || "Completed"}
                      </span>
                    ) : (
                      <span className="text-gray-500">
                        {t("teacher.enrolledOn") || "Enrolled"}:{" "}
                        {formatDate(enrollment.enrolledAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {t("common.showing") || "Showing"}{" "}
            {(pagination.page - 1) * pagination.limit + 1}-
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            {t("common.of") || "of"} {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              {t("common.previous") || "Previous"}
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
            >
              {t("common.next") || "Next"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
