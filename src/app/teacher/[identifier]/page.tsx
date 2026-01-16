"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Star,
  Users,
  BookOpen,
  Award,
  Clock,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useIsAuthenticated } from "@/store";
import {
  landingAPI,
  type TeacherProfile,
  type LandingSettings,
  type TeacherCourse,
} from "@/lib/api";

interface PageProps {
  params: Promise<{ identifier: string }>;
}

export default function TeacherLandingPage({ params }: PageProps) {
  const { identifier } = use(params);
  const t = useTranslations();
  const isAuthenticated = useIsAuthenticated();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacher, setTeacher] = useState<TeacherProfile | null>(null);
  const [landing, setLanding] = useState<LandingSettings | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme colors from landing settings
  const primaryColor = landing?.primaryColor || "#7EA2D4";
  const backgroundColor = landing?.backgroundColor || "#1a1a1a";
  const textColor = landing?.textColor || "#ffffff";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await landingAPI.getPublicLanding(identifier);

        if (response.success && response.teacher) {
          setTeacher(response.teacher);
          setLanding(response.landing || null);
          setCourses(response.courses || []);

          // Store identifier for student dashboard navigation
          sessionStorage.setItem("currentTeacherId", identifier);
        } else {
          setError("not_found");
        }
      } catch (err) {
        console.error("Failed to load teacher landing:", err);
        setError("error");
      } finally {
        setIsLoading(false);
      }
    };

    if (identifier) {
      loadData();
    }
  }, [identifier]);

  // Loading state
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

  // Error state - Teacher not found
  if (error === "not_found" || !teacher) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
        <div className="text-center">
          <div className="mb-6 text-8xl opacity-30">🔍</div>
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

  const fullName = `${teacher.firstName} ${teacher.lastName}`.trim();
  const logoText = landing?.logoText || "DarsLinker";

  // Navigation items
  const navItems = [
    { href: "#home", label: t("landing.home") },
    { href: "#about", label: t("landing.about") },
    { href: "#courses", label: t("landing.courses") },
    ...(landing?.certificates?.length
      ? [{ href: "#certificates", label: t("landing.certificates") }]
      : []),
    ...(landing?.testimonials?.length
      ? [{ href: "#testimonials", label: t("landing.testimonials") }]
      : []),
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
          {/* Logo */}
          <Link href={`/teacher/${identifier}`} className="text-xl font-bold">
            <span style={{ color: primaryColor }}>
              {logoText.includes("linker") ? (
                <>
                  {logoText.split(/linker/i)[0]}
                  <span className="text-white">linker</span>
                </>
              ) : (
                logoText
              )}
            </span>
          </Link>

          {/* Desktop Nav */}
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

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <Link href={`/teacher/${identifier}/student-dashboard`}>
                <Button
                  className="text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  {t("landing.goToDashboard")}
                </Button>
              </Link>
            ) : (
              <>
                <Link href={`/login?redirect=/teacher/${identifier}`}>
                  <Button variant="ghost" style={{ color: textColor }}>
                    {t("landing.login")}
                  </Button>
                </Link>
                <Link href={`/register?redirect=/teacher/${identifier}`}>
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

          {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
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
                  <Link href={`/teacher/${identifier}/student-dashboard`}>
                    <Button
                      className="w-full text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t("landing.goToDashboard")}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href={`/login?redirect=/teacher/${identifier}`}>
                      <Button variant="outline" className="w-full">
                        {t("landing.login")}
                      </Button>
                    </Link>
                    <Link href={`/register?redirect=/teacher/${identifier}`}>
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
              {teacher.avatar ? (
                <Image
                  src={teacher.avatar}
                  alt={fullName}
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
                {fullName}
              </h1>
              {teacher.specialization && (
                <p className="text-lg opacity-80">{teacher.specialization}</p>
              )}
            </div>

            {/* Hero Text */}
            {landing?.heroTitle && (
              <div className="max-w-2xl">
                <h2
                  className="mb-2 text-2xl font-semibold"
                  style={{ color: primaryColor }}
                >
                  {landing.heroTitle}
                </h2>
                {landing.heroSubtitle && (
                  <p className="opacity-80">{landing.heroSubtitle}</p>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="mt-4 flex flex-wrap justify-center gap-6 md:gap-12">
              {teacher.totalStudents !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-2xl font-bold">
                      {teacher.totalStudents}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">{t("landing.students")}</p>
                </div>
              )}
              {teacher.rating !== undefined && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Star
                      className="h-5 w-5 fill-current"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-2xl font-bold">
                      {teacher.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">{t("landing.rating")}</p>
                </div>
              )}
              {teacher.experience && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Award
                      className="h-5 w-5"
                      style={{ color: primaryColor }}
                    />
                    <span className="text-2xl font-bold">
                      {teacher.experience}
                    </span>
                  </div>
                  <p className="text-sm opacity-60">
                    {t("landing.experience")}
                  </p>
                </div>
              )}
            </div>

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

      {/* About Section */}
      {(teacher.bio || landing?.aboutText) && (
        <section
          id="about"
          className="py-16"
          style={{ backgroundColor: `${primaryColor}11` }}
        >
          <div className="mx-auto max-w-4xl px-4">
            <h2
              className="mb-8 text-center text-2xl font-bold md:text-3xl"
              style={{ color: primaryColor }}
            >
              {t("landing.aboutTeacher")}
            </h2>
            <p className="text-center leading-relaxed whitespace-pre-line opacity-90">
              {landing?.aboutText || teacher.bio}
            </p>
          </div>
        </section>
      )}

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
                <Card
                  key={course._id}
                  className="overflow-hidden border-0 transition-transform hover:scale-[1.02]"
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
                      {course.totalLessons !== undefined && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: `${textColor}88` }}
                        >
                          <BookOpen className="h-4 w-4" />
                          {course.totalLessons} {t("landing.lessons")}
                        </span>
                      )}
                      {course.enrolledCount !== undefined && (
                        <span
                          className="flex items-center gap-1"
                          style={{ color: `${textColor}88` }}
                        >
                          <Users className="h-4 w-4" />
                          {course.enrolledCount} {t("landing.enrolled")}
                        </span>
                      )}
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
                          ? `${course.price.toLocaleString()} ${course.currency || "UZS"}`
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Certificates Section */}
      {landing?.certificates && landing.certificates.length > 0 && (
        <section
          id="certificates"
          className="py-16"
          style={{ backgroundColor: `${primaryColor}11` }}
        >
          <div className="mx-auto max-w-6xl px-4">
            <h2
              className="mb-8 text-center text-2xl font-bold md:text-3xl"
              style={{ color: primaryColor }}
            >
              {t("landing.certificatesSection")}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {landing.certificates.map((cert, index) => (
                <Card
                  key={index}
                  className="border-0"
                  style={{ backgroundColor: `${primaryColor}22` }}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Award
                        className="h-8 w-8"
                        style={{ color: primaryColor }}
                      />
                      <div>
                        <h3
                          className="font-semibold"
                          style={{ color: textColor }}
                        >
                          {cert.title}
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: `${textColor}88` }}
                        >
                          {cert.organization}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm" style={{ color: `${textColor}66` }}>
                      {cert.year}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {landing?.testimonials && landing.testimonials.length > 0 && (
        <section id="testimonials" className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2
              className="mb-8 text-center text-2xl font-bold md:text-3xl"
              style={{ color: primaryColor }}
            >
              {t("landing.testimonialsSection")}
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {landing.testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className="border-0"
                  style={{ backgroundColor: `${primaryColor}22` }}
                >
                  <CardContent className="p-4">
                    {/* Rating */}
                    <div className="mb-3 flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? "fill-current"
                              : "opacity-30"
                          }`}
                          style={{
                            color:
                              i < testimonial.rating ? primaryColor : textColor,
                          }}
                        />
                      ))}
                    </div>

                    {/* Text */}
                    <p
                      className="mb-4 text-sm"
                      style={{ color: `${textColor}cc` }}
                    >
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Author */}
                    <p className="font-medium" style={{ color: textColor }}>
                      — {testimonial.name}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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
