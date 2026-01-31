"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { StudentCoursesView } from "./student-courses";
import {
  BookOpen,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Archive,
  CheckCircle,
  Trash2,
  Users,
  Plus,
  X,
  Edit,
  Layers,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { adminService } from "@/services/admin";
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuDivider,
} from "@/components/ui/action-menu";
import type { AdminCourse, AdminUser, Pagination } from "@/lib/api/admin";

type StatusFilter = "all" | "draft" | "active" | "approved" | "archived";
type TypeFilter = "all" | "free" | "paid";

function AdminCoursesView() {
  const t = useTranslations();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [page, setPage] = useState(1);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Create course modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teachers, setTeachers] = useState<AdminUser[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    teacherId: "",
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    type: "free" as "free" | "paid",
    price: 0,
    status: "draft" as "draft" | "active" | "approved" | "archived",
  });

  // Edit course modal
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    type: "free" as "free" | "paid",
    price: 0,
    status: "draft" as "draft" | "active" | "approved" | "archived",
  });

  const loadTeachers = async () => {
    // Load both teachers and admins who can own courses
    const [teachersData, adminsData] = await Promise.all([
      adminService.listUsers({ role: "teacher", limit: 100 }),
      adminService.listUsers({ role: "admin", limit: 100 }),
    ]);

    const allUsers: AdminUser[] = [];
    if (teachersData) {
      allUsers.push(...teachersData.users);
    }
    if (adminsData) {
      allUsers.push(...adminsData.users);
    }
    setTeachers(allUsers);
  };

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminService.listCourses({
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
        setError(t("admin.statsLoadError") || "Failed to load courses");
      }
    } catch {
      setError(t("admin.statsLoadError") || "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  const handleStatusChange = async (
    courseId: string,
    newStatus: "draft" | "active" | "approved" | "archived"
  ) => {
    setIsUpdating(courseId);

    const result = await adminService.updateCourseStatus(courseId, {
      status: newStatus,
    });
    if (result) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
      );
    }

    setIsUpdating(null);
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    setIsUpdating(courseId);

    const result = await adminService.deleteCourse(courseId);
    if (result) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }

    setIsUpdating(null);
  };

  const handleCreateCourse = async () => {
    if (!newCourse.teacherId || !newCourse.title || !newCourse.description) {
      return;
    }

    setIsCreating(true);

    const result = await adminService.createCourse({
      teacherId: newCourse.teacherId,
      title: newCourse.title,
      slug: newCourse.slug || undefined,
      description: newCourse.description,
      thumbnail: newCourse.thumbnail || undefined,
      type: newCourse.type,
      price: newCourse.type === "paid" ? newCourse.price : 0,
      status: newCourse.status,
    });

    if (result) {
      setCourses((prev) => [result, ...prev]);
      setShowCreateModal(false);
      setNewCourse({
        teacherId: "",
        title: "",
        slug: "",
        description: "",
        thumbnail: "",
        type: "free",
        price: 0,
        status: "draft",
      });
    }

    setIsCreating(false);
  };

  const handleOpenEdit = (course: AdminCourse) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      thumbnail: course.thumbnail || "",
      type: course.type,
      price: course.price,
      status: course.status,
    });
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;

    setIsUpdating(editingCourse.id);

    const result = await adminService.fullUpdateCourse(editingCourse.id, {
      title: editForm.title,
      slug: editForm.slug,
      description: editForm.description,
      thumbnail: editForm.thumbnail || null,
      type: editForm.type,
      price: editForm.type === "paid" ? editForm.price : 0,
      status: editForm.status,
    });

    if (result) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                title: editForm.title,
                slug: editForm.slug,
                description: editForm.description,
                thumbnail: editForm.thumbnail || "",
                type: editForm.type,
                price: editForm.type === "paid" ? editForm.price : 0,
                status: editForm.status,
              }
            : c
        )
      );
      setEditingCourse(null);
    }

    setIsUpdating(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " UZS";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-blue-500/10 text-blue-400",
      approved: "bg-green-500/10 text-green-400",
      draft: "bg-yellow-500/10 text-yellow-400",
      archived: "bg-muted text-muted-foreground",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}
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
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[type] || "bg-muted text-muted-foreground"}`}
      >
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.courses") || "Courses"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("teacher.manageYourCourses") || "Manage all courses"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("admin.addCourse") || "Add Course"}
          </button>
          <button
            onClick={loadCourses}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh") || "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("course.searchCourses") || "Search courses..."}
              className="w-full rounded-lg border border-border bg-secondary py-2 pr-4 pl-10 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
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
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
          >
            <option value="all">
              {t("admin.allStatuses") || "All Statuses"}
            </option>
            <option value="draft">
              {t("teacher.status.draft") || "Draft"}
            </option>
            <option value="active">{t("admin.active") || "Active"}</option>
            <option value="approved">
              {t("admin.approved") || "Approved"}
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
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
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

      <div className="overflow-hidden rounded-xl border border-border bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Course
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Teacher
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Price
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Enrollments
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-16 animate-pulse rounded bg-secondary" />
                        <div className="h-4 w-40 animate-pulse rounded bg-secondary" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t("teacher.noCourses") || "No courses found"}
                    </p>
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-border transition-colors hover:bg-card"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="h-12 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-16 items-center justify-center rounded bg-secondary">
                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">
                            {course.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.modulesCount} modules
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">
                        {course.teacher.firstName} {course.teacher.lastName}
                      </p>
                      {course.teacher.username && (
                        <p className="text-sm text-muted-foreground">
                          @{course.teacher.username}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(course.type)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {course.type === "free"
                        ? t("course.free") || "Free"
                        : formatCurrency(course.price)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(course.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-foreground">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {course.enrollmentsCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu isLoading={isUpdating === course.id}>
                        <ActionMenuItem
                          href={`/courses/${course.slug}`}
                          icon={<Eye className="h-4 w-4" />}
                          external
                        >
                          View Course
                        </ActionMenuItem>

                        <ActionMenuItem
                          onClick={() => handleOpenEdit(course)}
                          icon={<Edit className="h-4 w-4" />}
                        >
                          Edit Course
                        </ActionMenuItem>

                        <ActionMenuItem
                          href={`/admin/courses/${course.id}`}
                          icon={<Layers className="h-4 w-4" />}
                        >
                          Manage Content
                        </ActionMenuItem>

                        <ActionMenuDivider />

                        {course.status === "draft" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(course.id, "active")
                            }
                            icon={<CheckCircle className="h-4 w-4" />}
                            variant="info"
                          >
                            Set Active
                          </ActionMenuItem>
                        )}

                        {course.status !== "approved" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(course.id, "approved")
                            }
                            icon={<CheckCircle className="h-4 w-4" />}
                            variant="success"
                          >
                            Approve (Public)
                          </ActionMenuItem>
                        )}

                        {(course.status === "active" ||
                          course.status === "approved") && (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(course.id, "draft")
                            }
                            icon={<Archive className="h-4 w-4" />}
                            variant="warning"
                          >
                            Unpublish
                          </ActionMenuItem>
                        )}

                        {course.status !== "archived" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(course.id, "archived")
                            }
                            icon={<Archive className="h-4 w-4" />}
                          >
                            Archive
                          </ActionMenuItem>
                        )}

                        <ActionMenuDivider />

                        <ActionMenuItem
                          onClick={() => handleDelete(course.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="danger"
                        >
                          Delete Course
                        </ActionMenuItem>
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} courses)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                {t("blog.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.addCourse") || "Add New Course"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("admin.courseOwner") || "Course Owner"} *
                </label>
                <select
                  value={newCourse.teacherId}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, teacherId: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select owner</option>
                  {teachers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}{" "}
                      {user.username ? `(@${user.username})` : ""} [{user.role}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("course.title") || "Title"} *
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Slug (optional)
                </label>
                <input
                  type="text"
                  value={newCourse.slug}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, slug: e.target.value })
                  }
                  placeholder="auto-generated-if-empty"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("course.description") || "Description"} *
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={newCourse.thumbnail}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, thumbnail: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={newCourse.type}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        type: e.target.value as "free" | "paid",
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="free">{t("course.free") || "Free"}</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={newCourse.status}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        status: e.target.value as typeof newCourse.status,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {newCourse.type === "paid" && (
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("course.price") || "Price"} (UZS)
                  </label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        price: Number(e.target.value),
                      })
                    }
                    min={0}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleCreateCourse}
                disabled={
                  isCreating ||
                  !newCourse.teacherId ||
                  !newCourse.title ||
                  !newCourse.description
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.addCourse") || "Add Course"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {t("teacher.editCourse") || "Edit Course"}
              </h3>
              <button
                onClick={() => setEditingCourse(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("course.title") || "Title"}
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">Slug</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) =>
                    setEditForm({ ...editForm, slug: e.target.value })
                  }
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  {t("course.description") || "Description"}
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={editForm.thumbnail}
                  onChange={(e) =>
                    setEditForm({ ...editForm, thumbnail: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    Type
                  </label>
                  <select
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        type: e.target.value as "free" | "paid",
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="free">{t("course.free") || "Free"}</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as typeof editForm.status,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="approved">Approved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {editForm.type === "paid" && (
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("course.price") || "Price"} (UZS)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        price: Number(e.target.value),
                      })
                    }
                    min={0}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingCourse(null)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleUpdateCourse}
                disabled={isUpdating === editingCourse.id}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating === editingCourse.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.save") || "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component - shows different views based on role
export default function DashboardCoursesPage() {
  const { user } = useAuth();

  // Students see their enrolled courses
  if (user?.role === "student") {
    return <StudentCoursesView />;
  }

  // Admins and moderators see course management
  return <AdminCoursesView />;
}
