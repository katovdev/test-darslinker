"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Users,
  CreditCard,
  Layers,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { teacherService } from "@/services/teacher";
import type { TeacherCourse, Pagination } from "@/lib/api/teacher";

export default function TeacherCoursesPage() {
  const t = useTranslations();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await teacherService.listCourses({
        page,
        limit: 20,
        status: (statusFilter as "draft" | "active" | "approved" | "archived") || undefined,
        search: search || undefined,
      });

      if (data) {
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        setError(t("teacher.coursesLoadError") || "Failed to load courses");
      }
    } catch {
      setError(t("teacher.coursesLoadError") || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-400">
            {t("teacher.draft") || "Draft"}
          </span>
        );
      case "active":
        return (
          <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
            {t("teacher.active") || "Active"}
          </span>
        );
      case "archived":
        return (
          <span className="rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-400">
            {t("teacher.archived") || "Archived"}
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "free" ? (
      <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
        {t("teacher.free") || "Free"}
      </span>
    ) : (
      <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs font-medium text-purple-400">
        {t("teacher.paid") || "Paid"}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("teacher.coursesTitle") || "My Courses"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("teacher.coursesSubtitle") || "Manage your courses"}
          </p>
        </div>
        <button
          onClick={loadCourses}
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("teacher.searchCourses") || "Search courses..."}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="">{t("teacher.allStatuses") || "All Statuses"}</option>
          <option value="draft">{t("teacher.draft") || "Draft"}</option>
          <option value="active">{t("teacher.active") || "Active"}</option>
          <option value="archived">{t("teacher.archived") || "Archived"}</option>
        </select>
      </div>

      {error && !isLoading && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-4"
            >
              <div className="mb-4 h-40 rounded-lg bg-gray-700/50" />
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-700/50" />
              <div className="h-4 w-1/2 rounded bg-gray-700/50" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && courses.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">
            {t("teacher.noCourses") || "No courses found"}
          </p>
        </div>
      )}

      {!isLoading && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30 transition-colors hover:border-gray-700"
            >
              <div className="relative h-40 bg-gray-700">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-gray-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {getStatusBadge(course.status)}
                  {getTypeBadge(course.type)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-white line-clamp-1">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                    {course.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {course.modulesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrollmentsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {course.paymentsCount}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-gray-700 pt-3">
                  <span className="text-sm text-gray-500">
                    {formatDate(course.createdAt)}
                  </span>
                  {course.type === "paid" && (
                    <span className="font-medium text-emerald-400">
                      {formatCurrency(course.price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            {t("common.showing") || "Showing"} {(pagination.page - 1) * pagination.limit + 1}-
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
