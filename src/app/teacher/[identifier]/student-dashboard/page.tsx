"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  BookOpen,
  Bell,
  LogOut,
  Menu,
  Play,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslations } from "@/hooks/use-locale";
import { useIsAuthenticated, useUser, useAppStore } from "@/store";
import {
  landingAPI,
  courseAPI,
  type LandingSettings,
  type EnrolledCourse,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export default function TeacherStudentDashboard({ params }: PageProps) {
  const { identifier } = use(params);
  const router = useRouter();
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const logout = useAppStore((state) => state.logout);

  const [isLoading, setIsLoading] = useState(true);
  const [landing, setLanding] = useState<LandingSettings | null>(null);
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);

  // Theme colors from landing settings
  const primaryColor = landing?.primaryColor || "#7EA2D4";
  const logoText = landing?.logoText || "DarsLinker";

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(`/login?redirect=/teacher/${identifier}/student-dashboard`);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load landing settings for theme
        const landingRes = await landingAPI.getPublicLanding(identifier);
        if (landingRes.success && landingRes.landing) {
          setLanding(landingRes.landing);
        }

        // Load enrolled courses
        const coursesRes = await courseAPI.getEnrolledCourses();
        if (coursesRes.success && coursesRes.data) {
          // Filter courses by this teacher (if needed)
          setCourses(coursesRes.data);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [identifier, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push(`/teacher/${identifier}`);
  };

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  // Stats calculation
  const completedCourses = courses.filter(
    (c) => c.progress?.isCompleted
  ).length;
  const inProgressCourses = courses.filter(
    (c) =>
      c.progress &&
      !c.progress.isCompleted &&
      c.progress.completionPercentage > 0
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-gray-600"
          style={{ borderTopColor: primaryColor }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur"
        style={{ borderColor: `${primaryColor}33` }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-64 border-gray-800 bg-gray-900"
              >
                <SheetHeader>
                  <SheetTitle style={{ color: primaryColor }}>
                    {logoText}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-6 space-y-2">
                  <Link
                    href={`/teacher/${identifier}/student-dashboard`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-white transition-colors"
                    style={{ backgroundColor: `${primaryColor}22` }}
                  >
                    <Home className="h-5 w-5" style={{ color: primaryColor }} />
                    {t("sidebar.dashboard")}
                  </Link>
                  <Link
                    href={`/teacher/${identifier}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    <BookOpen className="h-5 w-5" />
                    {t("landing.courses")}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link
              href={`/teacher/${identifier}`}
              className="text-xl font-bold"
              style={{ color: primaryColor }}
            >
              {logoText}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href={`/teacher/${identifier}/student-dashboard`}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors"
              style={{ backgroundColor: `${primaryColor}22` }}
            >
              <Home className="h-4 w-4" style={{ color: primaryColor }} />
              {t("sidebar.dashboard")}
            </Link>
            <Link
              href={`/teacher/${identifier}`}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              {t("landing.courses")}
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-gray-400 hover:text-white"
                >
                  <Avatar
                    className="h-8 w-8"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}aa)`,
                    }}
                  >
                    <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">
                    {user?.firstName} {user?.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 border-gray-800 bg-gray-900"
              >
                <DropdownMenuItem className="text-gray-300">
                  {user?.phone}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 text-red-400 focus:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  {t("dashboard.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {t("dashboard.welcomeBack")}, {user?.firstName}!
          </h1>
          <p className="mt-1 text-gray-400">{t("dashboard.continueJourney")}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-800 bg-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className="rounded-lg p-2"
                  style={{ backgroundColor: `${primaryColor}22` }}
                >
                  <BookOpen
                    className="h-5 w-5"
                    style={{ color: primaryColor }}
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {courses.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t("dashboard.activeCourses")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/20 p-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {completedCourses}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t("course.completed")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/20 p-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {inProgressCourses}
                  </p>
                  <p className="text-sm text-gray-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-800/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/20 p-2">
                  <svg
                    className="h-5 w-5 text-purple-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {completedCourses}
                  </p>
                  <p className="text-sm text-gray-400">
                    {t("dashboard.certificates")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">
            {t("dashboard.myCourses")}
          </h2>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-gray-800 bg-gray-800/50">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="mb-2 h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <Card className="border-gray-800 bg-gray-800/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-gray-600" />
                <h3 className="mb-2 text-lg font-medium text-white">
                  {t("dashboard.noEnrolledCourses")}
                </h3>
                <p className="mb-4 text-gray-400">{t("course.noCourses")}</p>
                <Link href={`/teacher/${identifier}`}>
                  <Button style={{ backgroundColor: primaryColor }}>
                    {t("course.browseCourses")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const progress = course.progress?.completionPercentage || 0;
                const isCompleted = course.progress?.isCompleted;

                return (
                  <Link key={course._id} href={`/student/course/${course._id}`}>
                    <Card className="h-full border-gray-800 bg-gray-800/50 transition-transform hover:scale-[1.02]">
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden rounded-t-lg">
                        {course.thumbnail ? (
                          <Image
                            src={course.thumbnail}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div
                            className="flex h-full items-center justify-center"
                            style={{ backgroundColor: `${primaryColor}33` }}
                          >
                            <BookOpen
                              className="h-12 w-12"
                              style={{ color: primaryColor }}
                            />
                          </div>
                        )}

                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100">
                          <div
                            className="rounded-full p-3"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Play className="h-6 w-6 text-white" />
                          </div>
                        </div>

                        {/* Completed badge */}
                        {isCompleted && (
                          <div className="absolute top-2 right-2 rounded-full bg-green-500 p-1">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-4">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-white">
                          {course.title}
                        </h3>

                        {/* Teacher name */}
                        <p className="mb-3 text-sm text-gray-400">
                          {course.teacher?.firstName} {course.teacher?.lastName}
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{t("course.progress")}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-2"
                            style={
                              {
                                "--progress-background": `${primaryColor}33`,
                                "--progress-foreground": primaryColor,
                              } as React.CSSProperties
                            }
                          />
                        </div>

                        {/* Action button */}
                        <Button
                          className="mt-4 w-full text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {progress > 0
                            ? t("dashboard.continueLearning")
                            : t("dashboard.startLearning")}
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
