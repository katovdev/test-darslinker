"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, BookOpen, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useIsAuthenticated } from "@/store";
import {
  publicPathAPI,
  type PathTeacher,
  type PathTeacherStats,
  type PathCourse,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function TeacherPublicPage({ params }: PageProps) {
  const { username } = use(params);
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<PathTeacher | null>(null);
  const [stats, setStats] = useState<PathTeacherStats | null>(null);
  const [courses, setCourses] = useState<PathCourse[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryColor = teacher?.primaryColor || "#7EA2D4";
  const backgroundColor = "#1a1a1a";
  const textColor = "#ffffff";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [landingRes, coursesRes] = await Promise.all([
          publicPathAPI.getTeacherLanding(username),
          publicPathAPI.getTeacherCourses(username),
        ]);

        if (landingRes.success && landingRes.data) {
          setTeacher(landingRes.data.teacher);
          setStats(landingRes.data.stats);
        }

        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data.courses);
        }
      } catch (err) {
        console.error("Failed to load teacher page:", err);
        setError("not_found");
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      loadData();
    }
  }, [username]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor, color: textColor }}
      >
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <Skeleton className="h-32 w-32 rounded-full" />
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error === "not_found" || !teacher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
        <div className="text-center">
          <div className="mb-6 text-8xl opacity-30">404</div>
          <h1
            className="mb-4 text-4xl font-bold"
            style={{ color: primaryColor }}
          >
            {t("landing.teacherNotFound")}
          </h1>
          <p className="mb-8 max-w-md text-gray-400">
            {t("landing.teacherNotFoundDesc")}
          </p>
          <Link href="/">
            <Button
              className="text-white"
              style={{ backgroundColor: primaryColor }}
            >
              {t("landing.goToHome")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const logoText = teacher.businessName || "DarsLinker";

  const navItems = [
    { href: "#home", label: t("landing.home") },
    { href: "#courses", label: t("landing.courses") },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor, color: textColor }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          borderColor: `${primaryColor}33`,
          backgroundColor: `${backgroundColor}ee`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={`/${username}`} className="text-xl font-bold">
            <span style={{ color: primaryColor }}>
              {logoText.toLowerCase().includes("linker") ? (
                <>
                  {logoText.split(/linker/i)[0]}
                  <span className="text-white">linker</span>
                </>
              ) : (
                logoText
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Link href="/student/dashboard">
                <Button
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("landing.goToDashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href={`/login?redirect=/${username}`}>
                  <Button variant="ghost" style={{ color: textColor }}>
                    {t("landing.login")}
                  </Button>
                </Link>
                <Link href={`/register?redirect=/${username}`}>
                  <Button
                    className="text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {t("landing.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div
            className="border-t px-4 py-4 md:hidden"
            style={{ borderColor: `${primaryColor}33` }}
          >
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link href="/student/dashboard">
                    <Button
                      className="w-full text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t("landing.goToDashboard")}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/login?redirect=/${username}`}>
                      <Button variant="outline" className="w-full">
                        {t("landing.login")}
                      </Button>
                    </Link>
                    <Link href={`/register?redirect=/${username}`}>
                      <Button
                        className="w-full text-white"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {t("landing.register")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center gap-8 text-center">
            {/* Avatar */}
            <div
              className="relative h-32 w-32 overflow-hidden rounded-full border-4 md:h-40 md:w-40"
              style={{ borderColor: primaryColor }}
            >
              {teacher.logoUrl ? (
                <Image
                  src={teacher.logoUrl}
                  alt={teacher.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {teacher.firstName?.charAt(0)}
                  {teacher.lastName?.charAt(0)}
                </div>
              )}
            </div>

            {/* Name & Title */}
            <div>
              <h1 className="mb-2 text-3xl font-bold md:text-5xl">
                {teacher.fullName}
              </h1>
              {teacher.specialization && (
                <p className="text-lg opacity-80">{teacher.specialization}</p>
              )}
            </div>

            {/* Stats */}
            {stats && (
              <div className="mt-4 flex flex-wrap justify-center gap-6 md:gap-12">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-2xl font-bold">
                      {stats.studentsCount}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">{t("landing.students")}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-2xl font-bold">
                      {stats.coursesCount}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">{t("landing.courses")}</p>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="mt-6">
              <a href="#courses">
                <Button
                  size="lg"
                  className="gap-2 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("landing.viewCourses")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2
            className="mb-8 text-center text-2xl font-bold md:text-3xl"
            style={{ color: primaryColor }}
          >
            {t("landing.availableCourses")}
          </h2>

          {courses.length === 0 ? (
            <p className="text-center opacity-60">No courses available yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Link key={course.id} href={`/${username}/${course.slug}`}>
                  <Card
                    className="h-full overflow-hidden border-0 transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: `${primaryColor}22` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video">
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
                    </div>

                    <CardContent className="p-4">
                      <h3
                        className="mb-2 line-clamp-2 font-semibold"
                        style={{ color: textColor }}
                      >
                        {course.title}
                      </h3>

                      {course.description && (
                        <p
                          className="mb-4 line-clamp-2 text-sm"
                          style={{ color: `${textColor}aa` }}
                        >
                          {course.description}
                        </p>
                      )}

                      {/* Course Info */}
                      <div className="mb-4 flex flex-wrap gap-3 text-sm">
                        <span
                          className="flex items-center gap-1"
                          style={{ color: `${textColor}88` }}
                        >
                          <BookOpen className="h-4 w-4" />
                          {course.lessonsCount} {t("landing.lessons")}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ color: `${textColor}88` }}
                        >
                          <Users className="h-4 w-4" />
                          {course.enrollmentsCount} {t("landing.enrolled")}
                        </span>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={course.price ? "secondary" : "default"}
                          style={{
                            backgroundColor: course.price
                              ? `${primaryColor}33`
                              : primaryColor,
                            color: course.price ? textColor : "#fff",
                          }}
                        >
                          {course.price
                            ? `${course.price.toLocaleString()} UZS`
                            : t("landing.free")}
                        </Badge>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1"
                          style={{ color: primaryColor }}
                        >
                          {t("landing.viewCourse")}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{ borderColor: `${primaryColor}33` }}
      >
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="text-sm opacity-60">{t("landing.poweredBy")}</p>
        </div>
      </footer>
    </div>
  );
}
