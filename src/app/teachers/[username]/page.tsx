"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Play,
  ArrowLeft,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import {
  teacherPublicAPI,
  type TeacherPublicProfile,
  type TeacherCourse,
  type TeacherStats,
} from "@/lib/api";
import { HomeHeader, HomeFooter } from "@/components/home";
import { CourseRatingBadge } from "@/components/course/rating-badge";

export default function TeacherLandingPage() {
  const params = useParams();
  const username = params.username as string;
  const t = useTranslations();

  const [teacher, setTeacher] = useState<TeacherPublicProfile | null>(null);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeacherProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherPublicAPI.getProfile(username);
      if (response.success && response.data) {
        setTeacher(response.data.teacher);
        setCourses(response.data.courses);
        setStats(response.data.stats);
      } else {
        setError(t("teacher.notFound") || "Teacher not found");
      }
    } catch (err) {
      setError(t("teacher.loadError") || "Failed to load teacher profile");
      console.error("Failed to load teacher profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadTeacherProfile();
    }
  }, [username]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "";

  const displayName = teacher?.businessName || teacherName;

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      {isLoading && (
        <div className="flex min-h-[60vh] items-center justify-center pt-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      )}

      {error && !isLoading && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-20">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
            <Users className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            {t("common.error") || "Error"}
          </h3>
          <p className="mb-6 text-center text-gray-400">{error}</p>
          <div className="flex gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-all hover:border-gray-600 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("common.back") || "Back"}
            </Link>
            <button
              onClick={loadTeacherProfile}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition-all hover:bg-blue-600"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry") || "Retry"}
            </button>
          </div>
        </div>
      )}

      {!isLoading && !error && teacher && (
        <>
          <section className="relative overflow-hidden px-4 pt-24 pb-12 sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
              <div className="absolute top-1/4 right-0 h-[300px] w-[300px] rounded-full bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />
            </div>

            {teacher.settings?.bannerUrl && (
              <div className="mx-auto mb-8 max-w-6xl overflow-hidden rounded-2xl">
                <img
                  src={teacher.settings.bannerUrl}
                  alt="Banner"
                  className="h-48 w-full object-cover sm:h-64"
                />
              </div>
            )}

            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                {teacher.logoUrl ? (
                  <img
                    src={teacher.logoUrl}
                    alt={displayName}
                    className="h-28 w-28 rounded-2xl border-4 border-gray-800 object-cover shadow-xl sm:h-36 sm:w-36"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-gray-800 bg-gradient-to-br from-blue-500 to-purple-600 text-4xl font-bold text-white shadow-xl sm:h-36 sm:w-36 sm:text-5xl">
                    {teacher.firstName.charAt(0)}
                    {teacher.lastName.charAt(0)}
                  </div>
                )}

                <div className="mt-6 sm:mt-0 sm:ml-8">
                  <h1 className="text-3xl font-bold text-white sm:text-4xl">
                    {displayName}
                  </h1>
                  {teacher.businessName && (
                    <p className="mt-1 text-lg text-gray-400">{teacherName}</p>
                  )}
                  {teacher.specialization && (
                    <p className="mt-2 text-blue-400">
                      {teacher.specialization}
                    </p>
                  )}
                  {teacher.settings?.tagline && (
                    <p className="mt-3 max-w-2xl text-gray-300">
                      {teacher.settings.tagline}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                    {teacher.settings?.telegramUrl && (
                      <a
                        href={teacher.settings.telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0088cc]/10 px-3 py-1.5 text-sm text-[#0088cc] transition-colors hover:bg-[#0088cc]/20"
                      >
                        Telegram
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {teacher.settings?.instagramUrl && (
                      <a
                        href={teacher.settings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-pink-500/10 px-3 py-1.5 text-sm text-pink-400 transition-colors hover:bg-pink-500/20"
                      >
                        Instagram
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {teacher.settings?.youtubeUrl && (
                      <a
                        href={teacher.settings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-sm text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        YouTube
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {teacher.settings?.websiteUrl && (
                      <a
                        href={teacher.settings.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-500/10 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-500/20"
                      >
                        <Globe className="h-3 w-3" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {stats && (
                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(teacher.settings?.showCoursesCount ?? true) && (
                    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                        <span className="text-2xl font-bold text-white">
                          {stats.coursesCount}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("teacher.courses") || "Courses"}
                      </p>
                    </div>
                  )}
                  {(teacher.settings?.showStudentsCount ?? true) && (
                    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Users className="h-5 w-5 text-green-400" />
                        <span className="text-2xl font-bold text-white">
                          {stats.studentsCount}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("teacher.students") || "Students"}
                      </p>
                    </div>
                  )}
                  {(teacher.settings?.showRating ?? true) && (
                    <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">
                          {stats.overallRating > 0
                            ? stats.overallRating.toFixed(1)
                            : "-"}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {t("teacher.rating") || "Rating"}
                      </p>
                    </div>
                  )}
                  <div className="rounded-xl border border-gray-800 bg-gray-800/30 p-4 text-center transition-all hover:border-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-5 w-5 text-purple-400" />
                      <span className="text-2xl font-bold text-white">
                        {stats.totalReviews}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {t("teacher.reviews") || "Reviews"}
                    </p>
                  </div>
                </div>
              )}

              {teacher.settings?.aboutText && (
                <div className="mt-10 rounded-xl border border-gray-800 bg-gray-800/30 p-6">
                  <h2 className="mb-4 text-xl font-semibold text-white">
                    {t("teacher.about") || "About"}
                  </h2>
                  <p className="whitespace-pre-wrap text-gray-300">
                    {teacher.settings.aboutText}
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="relative px-4 pb-20 sm:px-6 lg:px-8">
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-gray-800" />

            <div className="mx-auto max-w-6xl">
              <h2 className="mb-8 text-2xl font-bold text-white">
                {t("teacher.allCourses") || "All Courses"} ({courses.length})
              </h2>

              {courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-800 bg-gray-800/30 py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                    <BookOpen className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {t("teacher.noCourses") || "No courses yet"}
                  </h3>
                  <p className="text-gray-400">
                    {t("teacher.noCoursesDesc") ||
                      "This teacher hasn't published any courses yet."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="group relative block"
                    >
                      <div className="relative rounded-2xl border border-gray-800 bg-gray-800/30 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50">
                        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10" />

                        <div className="relative aspect-video overflow-hidden rounded-t-2xl bg-gray-700/50">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                              <BookOpen className="h-12 w-12 text-gray-600" />
                            </div>
                          )}

                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            {course.averageRating > 0 && (
                              <CourseRatingBadge
                                rating={course.averageRating}
                                reviewCount={course.totalReviews}
                                size="sm"
                              />
                            )}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                            <div className="flex h-14 w-14 scale-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-100">
                              <Play
                                className="h-6 w-6 text-white"
                                fill="white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="mb-3 line-clamp-2 text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
                            {course.title}
                          </h3>

                          <div className="mb-4 flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              <span>
                                {course.lessonsCount}{" "}
                                {t("course.lessons") || "lessons"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {formatDuration(course.totalDuration)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              {course.price > 0 ? (
                                <span className="text-lg font-bold text-white">
                                  {course.price.toLocaleString()}{" "}
                                  <span className="text-sm font-normal text-gray-500">
                                    UZS
                                  </span>
                                </span>
                              ) : (
                                <span className="text-lg font-bold text-green-400">
                                  {t("course.free") || "Free"}
                                </span>
                              )}
                            </div>
                            <span className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all group-hover:shadow-xl group-hover:shadow-blue-500/30">
                              {t("course.viewCourse") || "View"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      <HomeFooter />
    </div>
  );
}
