"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Archive,
  CheckCircle,
  Users,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { moderatorService } from "@/services/moderator";
import type { ModeratorCourse, Pagination } from "@/lib/api/moderator";

type StatusFilter = "all" | "draft" | "active" | "archived";
type TypeFilter = "all" | "free" | "paid";

export default function ModeratorCoursesPage() {
  const t = useTranslations();
  const [courses, setCourses] = useState<ModeratorCourse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await moderatorService.listCourses({
        page,
        limit: 20,
        status: statusFilter === "all" ? undefined : statusFilter,
        type: typeFilter === "all" ? undefined : typeFilter,
        search: search || undefined,
      });

      if (data) {
        setCourses(data.courses);
        setPagination(data.pagination);
      } else {
        setError(t("moderator.statsLoadError") || "Failed to load courses");
      }
    } catch {
      setError(t("moderator.statsLoadError") || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  const handleStatusChange = async (
    courseId: string,
    newStatus: "draft" | "active" | "archived"
  ) => {
    setIsUpdating(courseId);
    setActionMenuId(null);
    setActionMenuPosition(null);

    const result = await moderatorService.updateCourseStatus(courseId, {
      status: newStatus,
    });
    if (result) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
      );
    }

    setIsUpdating(null);
  };

  const handleOpenActionMenu = (
    courseId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (actionMenuId === courseId) {
      setActionMenuId(null);
      setActionMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setActionMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 192,
      });
      setActionMenuId(courseId);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-400",
      draft: "bg-yellow-500/10 text-yellow-400",
      archived: "bg-gray-500/10 text-gray-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-500/10 text-gray-400"}`}
      >
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      free: "bg-blue-500/10 text-blue-400",
      paid: "bg-purple-500/10 text-purple-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[type] || "bg-gray-500/10 text-gray-400"}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.courses") || "Courses"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.coursesSubtitle") || "Manage course status"}
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

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-400">
          {t("moderator.limitedCourseAccess") ||
            "As a moderator, you can only change course status. Course deletion and price management require admin access."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("course.searchCourses") || "Search courses..."}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t("blog.search") || "Search"}
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">
              {t("admin.allStatuses") || "All Statuses"}
            </option>
            <option value="active">{t("admin.active") || "Active"}</option>
            <option value="draft">
              {t("teacher.status.draft") || "Draft"}
            </option>
            <option value="archived">
              {t("teacher.status.archived") || "Archived"}
            </option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as TypeFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="free">{t("course.free") || "Free"}</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Course
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Teacher
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Type
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Enrollments
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 animate-pulse rounded bg-gray-700" />
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-2 text-gray-400">
                      {t("teacher.noCourses") || "No courses found"}
                    </p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-12 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-700">
                            <BookOpen className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">
                            {course.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {course.modulesCount} modules
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300">
                        {course.teacher.firstName} {course.teacher.lastName}
                      </p>
                      {course.teacher.username && (
                        <p className="text-sm text-gray-500">
                          @{course.teacher.username}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(course.type)}</td>
                    <td className="px-4 py-3">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <Users className="h-4 w-4 text-gray-500" />
                        {course.enrollmentsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleOpenActionMenu(course.id, e)}
                        disabled={isUpdating === course.id}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      >
                        {isUpdating === course.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} courses)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {t("blog.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Menu - Fixed Position */}
      {actionMenuId && actionMenuPosition && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setActionMenuId(null);
              setActionMenuPosition(null);
            }}
          />
          <div
            className="fixed z-50 w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl"
            style={{
              top: actionMenuPosition.top,
              left: Math.max(8, actionMenuPosition.left),
            }}
          >
            {(() => {
              const course = courses.find((c) => c.id === actionMenuId);
              if (!course) return null;
              return (
                <>
                  <a
                    href={`/courses/${course.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Course
                  </a>

                  <div className="my-1 border-t border-gray-700" />

                  {course.status !== "active" && (
                    <button
                      onClick={() => handleStatusChange(course.id, "active")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Publish
                    </button>
                  )}

                  {course.status === "active" && (
                    <button
                      onClick={() => handleStatusChange(course.id, "draft")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                    >
                      <Archive className="h-4 w-4" />
                      Unpublish
                    </button>
                  )}

                  {course.status !== "archived" && (
                    <button
                      onClick={() => handleStatusChange(course.id, "archived")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-gray-700"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
}
