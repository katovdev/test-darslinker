"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  BookOpen,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Globe,
  GlobeLock,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "@/hooks/use-locale";
import { teacherAPI, type TeacherOwnCourse } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: GlobeLock,
    className: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  },
  published: {
    label: "Published",
    icon: Globe,
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  archived: {
    label: "Archived",
    icon: GlobeLock,
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
};

export default function TeacherOwnCoursesPage() {
  const t = useTranslations();
  const [courses, setCourses] = useState<TeacherOwnCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<TeacherOwnCourse | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handlePublish = async (course: TeacherOwnCourse) => {
    try {
      if (course.status === "published") {
        await teacherAPI.unpublishCourse(course.id);
        toast.success(t("teacher.courseUnpublished"));
      } else {
        await teacherAPI.publishCourse(course.id);
        toast.success(t("teacher.coursePublished"));
      }
      loadCourses();
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to toggle publish:", err);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      await teacherAPI.deleteCourse(courseToDelete.id);
      toast.success(t("teacher.courseDeleted"));
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
    } catch (err) {
      toast.error(t("errors.generalError"));
      console.error("Failed to delete course:", err);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const confirmDelete = (course: TeacherOwnCourse) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  // Stats
  const publishedCount = courses.filter((c) => c.status === "published").length;
  const draftCount = courses.filter((c) => c.status === "draft").length;
  const totalStudents = courses.reduce((sum, c) => sum + c.enrolledCount, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-gray-700" />
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-gray-700" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("teacher.courses")}
          </h1>
          <p className="mt-1 text-gray-400">{t("teacher.manageYourCourses")}</p>
        </div>
        <Button asChild className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]">
          <Link href="/teacher/courses/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("teacher.createCourse")}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalCourses")}
              </p>
              <p className="text-xl font-bold text-white">{courses.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Globe className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{t("teacher.published")}</p>
              <p className="text-xl font-bold text-white">{publishedCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalStudents")}
              </p>
              <p className="text-xl font-bold text-white">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button
              onClick={loadCourses}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && courses.length === 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-800 p-4">
              <BookOpen className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("teacher.noCourses")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("teacher.createYourFirstCourse")}
              </p>
            </div>
            <Button
              asChild
              className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
            >
              <Link href="/teacher/courses/new">
                <Plus className="mr-2 h-4 w-4" />
                {t("teacher.createCourse")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Courses Grid */}
      {!error && courses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const status = statusConfig[course.status];
            const StatusIcon = status.icon;

            return (
              <Card
                key={course.id}
                className="border-gray-800 bg-gray-800/30 transition-colors hover:bg-gray-800/50"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-700">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className={cn(
                      "absolute top-2 left-2 flex items-center gap-1",
                      status.className
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {t(`teacher.status.${course.status}`)}
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-white">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                        {course.description || t("teacher.noDescription")}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="border-gray-800 bg-gray-900"
                      >
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/teacher/courses/${course.id}`}
                            className="flex cursor-pointer items-center gap-2 text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                            {t("common.edit")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePublish(course)}
                          className="flex cursor-pointer items-center gap-2 text-gray-300"
                        >
                          {course.status === "published" ? (
                            <>
                              <GlobeLock className="h-4 w-4" />
                              {t("teacher.unpublish")}
                            </>
                          ) : (
                            <>
                              <Globe className="h-4 w-4" />
                              {t("teacher.publish")}
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        <DropdownMenuItem
                          onClick={() => confirmDelete(course)}
                          className="flex cursor-pointer items-center gap-2 text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {course.lessonCount} {t("course.lessons")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.enrolledCount}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-white">
                      {course.price > 0
                        ? `${course.price.toLocaleString()} ${course.currency}`
                        : t("course.free")}
                    </span>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Link href={`/teacher/courses/${course.id}`}>
                        {t("common.edit")}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border-gray-800 bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {t("teacher.deleteCourse")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {t("teacher.deleteCourseConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-700 text-gray-300 hover:bg-gray-800">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? t("common.loading") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
