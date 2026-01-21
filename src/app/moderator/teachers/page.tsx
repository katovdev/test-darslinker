"use client";

import { useEffect, useState, useCallback, memo } from "react";
import {
  Search,
  RefreshCw,
  User,
  BookOpen,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  Mail,
  Phone,
  Calendar,
  Building,
  GraduationCap,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { toast } from "sonner";
import { moderatorService } from "@/services/moderator";
import type {
  ModeratorTeacher,
  ModeratorTeacherDetail,
} from "@/lib/api/moderator";

type SortOption = "newest" | "oldest" | "name" | "courses";

export default function ModeratorTeachersPage() {
  const t = useTranslations();
  const [teachers, setTeachers] = useState<ModeratorTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTeacher, setSelectedTeacher] =
    useState<ModeratorTeacherDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const loadTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await moderatorService.listTeachers({
        page,
        limit: 12,
        search: search || undefined,
        sort: sortBy,
      });

      if (data) {
        setTeachers(data.teachers);
        setTotalPages(data.pagination.totalPages);
      } else {
        toast.error(
          t("moderator.teachersLoadError") || "Failed to load teachers"
        );
      }
    } catch {
      toast.error(
        t("moderator.teachersLoadError") || "Failed to load teachers"
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, search, sortBy, t]);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const openTeacherDetail = async (id: string) => {
    setIsLoadingDetail(true);
    setIsModalOpen(true);

    const data = await moderatorService.getTeacher(id);
    if (data) {
      setSelectedTeacher(data);
    } else {
      toast.error(
        t("moderator.teacherDetailError") || "Failed to load teacher details"
      );
      setIsModalOpen(false);
    }
    setIsLoadingDetail(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTeacher(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case "blocked":
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.teachersTitle") || "Teachers Management"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.teachersSubtitle") ||
              "View and manage teacher profiles"}
          </p>
        </div>
        <button
          onClick={loadTeachers}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={
              t("moderator.searchTeachers") ||
              "Search by name, email, or phone..."
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value as SortOption);
            setPage(1);
          }}
          className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
        >
          <option value="newest">
            {t("moderator.sortNewest") || "Newest First"}
          </option>
          <option value="oldest">
            {t("moderator.sortOldest") || "Oldest First"}
          </option>
          <option value="name">{t("moderator.sortName") || "By Name"}</option>
          <option value="courses">
            {t("moderator.sortCourses") || "Most Courses"}
          </option>
        </select>
      </div>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-800 bg-gray-800/30 p-5"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-gray-700/50" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-24 rounded bg-gray-700/50" />
                  <div className="h-3 w-16 rounded bg-gray-700/50" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-700/50" />
                <div className="h-3 w-2/3 rounded bg-gray-700/50" />
              </div>
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-gray-600" />
          <p className="mt-4 text-gray-400">
            {t("moderator.noTeachers") || "No teachers found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onViewDetail={() => openTeacherDetail(teacher.id)}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              t={t}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-800/30 px-4 py-3">
          <p className="text-sm text-gray-400">
            {t("moderator.page") || "Page"} {page} {t("moderator.of") || "of"}{" "}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-gray-700 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Teacher Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-700 bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-white">
                {t("moderator.teacherDetails") || "Teacher Details"}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6">
              {isLoadingDetail ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-gray-700/50" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-700/50" />
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700/50" />
                    </div>
                  </div>
                  <div className="h-24 animate-pulse rounded-lg bg-gray-700/50" />
                  <div className="h-32 animate-pulse rounded-lg bg-gray-700/50" />
                </div>
              ) : selectedTeacher ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4">
                    {selectedTeacher.logoUrl ? (
                      <img
                        src={selectedTeacher.logoUrl}
                        alt={selectedTeacher.firstName}
                        className="h-16 w-16 rounded-full border-2 border-gray-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600">
                        <span className="text-xl font-bold text-white">
                          {selectedTeacher.firstName[0]}
                          {selectedTeacher.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white">
                        {selectedTeacher.firstName} {selectedTeacher.lastName}
                      </h3>
                      {selectedTeacher.businessName && (
                        <p className="text-gray-400">
                          {selectedTeacher.businessName}
                        </p>
                      )}
                      {selectedTeacher.username && (
                        <p className="text-sm text-green-400">
                          @{selectedTeacher.username}
                        </p>
                      )}
                      <span
                        className={`mt-2 inline-block rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
                          selectedTeacher.status
                        )}`}
                      >
                        {selectedTeacher.status}
                      </span>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoItem
                      icon={Phone}
                      label={t("moderator.phone") || "Phone"}
                      value={selectedTeacher.phone}
                    />
                    <InfoItem
                      icon={Calendar}
                      label={t("moderator.joined") || "Joined"}
                      value={formatDate(selectedTeacher.createdAt)}
                    />
                    <InfoItem
                      icon={BookOpen}
                      label={t("moderator.courses") || "Courses"}
                      value={selectedTeacher.coursesCount.toString()}
                    />
                    <InfoItem
                      icon={Users}
                      label={t("moderator.students") || "Students"}
                      value={selectedTeacher.studentsCount.toString()}
                    />
                    {selectedTeacher.specialization && (
                      <InfoItem
                        icon={GraduationCap}
                        label={
                          t("moderator.specialization") || "Specialization"
                        }
                        value={selectedTeacher.specialization}
                        className="sm:col-span-2"
                      />
                    )}
                  </div>

                  {/* Courses List */}
                  {selectedTeacher.courses &&
                    selectedTeacher.courses.length > 0 && (
                      <div>
                        <h4 className="mb-3 font-medium text-white">
                          {t("moderator.teacherCourses") || "Courses"}
                        </h4>
                        <div className="space-y-2">
                          {selectedTeacher.courses.map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800/50 p-3"
                            >
                              <div>
                                <p className="font-medium text-white">
                                  {course.title}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {course.enrollmentsCount}{" "}
                                  {t("moderator.enrollments") || "enrollments"}
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs ${
                                  course.status === "active" ||
                                  course.status === "approved"
                                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                                    : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                                }`}
                              >
                                {course.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Actions */}
                  {selectedTeacher.username && (
                    <div className="flex justify-end">
                      <a
                        href={`/teachers/${selectedTeacher.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t("moderator.viewPublicProfile") ||
                          "View Public Profile"}
                      </a>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TeacherCardProps {
  teacher: ModeratorTeacher;
  onViewDetail: () => void;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  t: (key: string) => string;
}

const TeacherCard = memo(function TeacherCard({
  teacher,
  onViewDetail,
  formatDate,
  getStatusColor,
  t,
}: TeacherCardProps) {
  return (
    <div
      onClick={onViewDetail}
      className="cursor-pointer rounded-xl border border-gray-800 bg-gray-800/30 p-5 transition-all hover:border-gray-700 hover:bg-gray-800/50"
    >
      <div className="mb-4 flex items-center gap-3">
        {teacher.logoUrl ? (
          <img
            src={teacher.logoUrl}
            alt={teacher.firstName}
            className="h-12 w-12 rounded-full border border-gray-700 object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-teal-600">
            <span className="text-sm font-bold text-white">
              {teacher.firstName[0]}
              {teacher.lastName[0]}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-white">
            {teacher.firstName} {teacher.lastName}
          </p>
          {teacher.username && (
            <p className="truncate text-sm text-gray-500">
              @{teacher.username}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            {t("moderator.courses") || "Courses"}
          </span>
          <span className="font-medium text-white">{teacher.coursesCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            {t("moderator.students") || "Students"}
          </span>
          <span className="font-medium text-white">
            {teacher.studentsCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">
            {t("moderator.joined") || "Joined"}
          </span>
          <span className="text-gray-400">{formatDate(teacher.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
            teacher.status
          )}`}
        >
          {teacher.status}
        </span>
        <span className="text-xs text-green-400 hover:underline">
          {t("moderator.viewDetails") || "View Details"}
        </span>
      </div>
    </div>
  );
});

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}

function InfoItem({ icon: Icon, label, value, className = "" }: InfoItemProps) {
  return (
    <div
      className={`rounded-lg border border-gray-700 bg-gray-800/50 p-3 ${className}`}
    >
      <div className="mb-1 flex items-center gap-2 text-gray-400">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium text-white">{value}</p>
    </div>
  );
}
