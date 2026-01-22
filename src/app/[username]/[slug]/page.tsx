"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  User,
  Play,
  ArrowLeft,
  CheckCircle,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import { courseContentApi, type ModuleDetail } from "@/lib/api/course-content";
import { reviewService, type TransformedReview } from "@/services/reviews";
import { HomeHeader, HomeFooter } from "@/components/home";
import { StarRating } from "@/components/ui/star-rating";
import { CourseRatingBadge } from "@/components/course/rating-badge";
import { RatingStats } from "@/components/course/rating-stats";
import { ReviewsList } from "@/components/course/reviews-list";
import { ReviewForm } from "@/components/course/review-form";
import { Button } from "@/components/ui/button";

export default function TeacherCourseDetailPage() {
  const params = useParams();
  const teacherUsername = params.username as string;
  const slug = params.slug as string;
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<GlobalCourse | null>(null);
  const [modules, setModules] = useState<ModuleDetail[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<TransformedReview | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );

  const handleEnroll = useCallback(async () => {
    if (!course) return;

    setIsEnrolling(true);
    try {
      if (course.price === 0 || course.type === "free") {
        // Free course - direct enrollment
        const response = await courseAPI.enrollInFreeCourse(course.id);
        if (response.success) {
          setIsEnrolled(true);
          // Redirect to student course learning page
          window.location.href = `/${teacherUsername}/${course.slug}/learn`;
        }
      } else {
        // Paid course - redirect to payment page
        window.location.href = `/student/courses/${course.id}/payment`;
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      const errorMessage =
        error && typeof error === "object" && "error" in error
          ? (error.error as { message?: string })?.message
          : "Failed to enroll in course";
      alert(errorMessage);
    } finally {
      setIsEnrolling(false);
    }
  }, [course]);

  // Parallel data fetching - load course and prepare review fetch
  useEffect(() => {
    if (!slug || !teacherUsername) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await courseAPI.getCourses();
        if (!response.success || !response.data) {
          setError(t("course.loadError") || "Failed to load course");
          return;
        }

        // Find course by slug
        const foundCourse = response.data.all.find((c) => c.slug === slug);
        if (!foundCourse) {
          setError(t("course.courseNotFound") || "Course not found");
          return;
        }

        // Verify course belongs to the teacher
        if (foundCourse.teacher.username !== teacherUsername) {
          setError(t("course.courseNotFound") || "Course not found");
          return;
        }

        const enrolled = response.data.enrolled.some(
          (c) => c.id === foundCourse.id
        );

        // Fetch course modules/lessons
        let courseModules: ModuleDetail[] = [];
        try {
          const contentResponse = await courseContentApi.getCourseContent(
            foundCourse.id
          );
          if (contentResponse.success && contentResponse.data) {
            courseModules = contentResponse.data.modules || [];
          }
        } catch (err) {
          console.error("Failed to load course content:", err);
          // Continue without modules
        }

        // Fetch review in parallel if authenticated
        let review: TransformedReview | null = null;
        if (isAuthenticated) {
          try {
            const reviewResponse = await reviewService.getMyReview(
              foundCourse.id
            );
            if (reviewResponse.success) {
              review = reviewResponse.data;
            }
          } catch (err) {
            // No review yet
          }
        }

        // Batch state updates
        setCourse(foundCourse);
        setModules(courseModules);
        setIsEnrolled(enrolled);
        setMyReview(review);
      } catch (err) {
        setError(t("course.loadError") || "Failed to load course");
        console.error("Failed to load course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, teacherUsername, isAuthenticated]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleReviewSuccess = (review: TransformedReview) => {
    setMyReview(review);
    setIsEditingReview(false);
    setReviewKey((k) => k + 1);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (course) {
      const response = await reviewService.deleteReview(reviewId, course.id);
      if (response.success) {
        setMyReview(null);
        setReviewKey((k) => k + 1);
      }
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <HomeHeader />
        <div className="mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 rounded bg-gray-700" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="aspect-video rounded-xl bg-gray-700" />
                <div className="h-8 w-3/4 rounded bg-gray-700" />
                <div className="h-4 w-full rounded bg-gray-700/50" />
                <div className="h-4 w-2/3 rounded bg-gray-700/50" />
              </div>
              <div className="space-y-4">
                <div className="h-48 rounded-xl bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-900">
        <HomeHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
            <BookOpen className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            {t("course.courseNotFound") || "Course Not Found"}
          </h1>
          <p className="mb-6 text-center text-gray-400">
            {error ||
              t("course.notFoundDesc") ||
              "The course you're looking for doesn't exist."}
          </p>
          <Link href={`/${teacherUsername}`}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back") || "Back to Teacher"}
            </Button>
          </Link>
        </div>
        <HomeFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 lg:px-8">
        <Link
          href={`/${teacherUsername}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("common.back") || "Back to"} {course.teacher.firstName}{" "}
          {course.teacher.lastName}
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-800">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <BookOpen className="h-20 w-20 text-gray-600" />
                </div>
              )}

              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" fill="white" />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {course.averageRating > 0 && (
                  <CourseRatingBadge
                    rating={course.averageRating}
                    reviewCount={course.totalReviews}
                  />
                )}
                {isEnrolled && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-1 text-sm text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    {t("course.enrolled") || "Enrolled"}
                  </span>
                )}
              </div>

              <h1 className="mb-4 text-3xl font-bold text-white">
                {course.title}
              </h1>

              <div className="mb-4 flex items-center gap-3">
                {course.teacher.logoUrl ? (
                  <img
                    src={course.teacher.logoUrl}
                    alt={`${course.teacher.firstName} ${course.teacher.lastName}`}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-700">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )}
                <div>
                  <Link
                    href={`/${teacherUsername}`}
                    className="font-medium text-white hover:text-blue-400"
                  >
                    {course.teacher.firstName} {course.teacher.lastName}
                  </Link>
                  <p className="text-sm text-gray-400">
                    {t("course.teacher") || "Teacher"}
                  </p>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>
                    {course.modulesCount} {t("course.modules") || "modules"} •{" "}
                    {course.lessonsCount} {t("course.lessons") || "lessons"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
              </div>

              {course.description && (
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-xl font-semibold text-white">
                    {t("course.description") || "Description"}
                  </h2>
                  <p className="text-gray-300">{course.description}</p>
                </div>
              )}
            </div>

            {/* Course Content / Modules */}
            {modules.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  {t("course.modules") || "Course Content"}
                </h2>

                {modules.map((module, idx) => (
                  <div
                    key={module.id}
                    className="rounded-xl border border-gray-800 bg-gray-800/30"
                  >
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-800/50"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {idx + 1}. {module.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-400">
                          {module.lessons.length}{" "}
                          {t("course.lessons") || "lessons"}
                        </p>
                      </div>
                      {expandedModules.has(module.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    {expandedModules.has(module.id) && (
                      <div className="border-t border-gray-800">
                        {module.lessons.map((lesson, lessonIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 border-b border-gray-800 p-4 last:border-b-0"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm text-gray-400">
                              {lessonIdx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-white">
                                {lesson.title}
                              </p>
                            </div>
                            {!isEnrolled && (
                              <Lock className="h-4 w-4 text-gray-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">
                {t("review.reviewsAndRatings") || "Reviews & Ratings"}
              </h2>

              <RatingStats courseId={course.id} />

              {isEnrolled && !myReview && (
                <ReviewForm
                  courseId={course.id}
                  onSuccess={handleReviewSuccess}
                />
              )}

              {myReview && isEditingReview && (
                <ReviewForm
                  courseId={course.id}
                  existingReview={myReview}
                  onSuccess={handleReviewSuccess}
                  onCancel={() => setIsEditingReview(false)}
                />
              )}

              {myReview && !isEditingReview && (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-400">
                      {t("review.yourReview") || "Your Review"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingReview(true)}
                    >
                      {t("common.edit") || "Edit"}
                    </Button>
                  </div>
                  <StarRating rating={myReview.rating} size="sm" />
                  <p className="mt-2 text-sm text-gray-300">
                    {myReview.comment}
                  </p>
                </div>
              )}

              {!isEnrolled && isAuthenticated && (
                <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4 text-center">
                  <Lock className="mx-auto mb-2 h-6 w-6 text-gray-500" />
                  <p className="text-sm text-gray-400">
                    {t("review.enrollToReview") ||
                      "Enroll in this course to leave a review"}
                  </p>
                </div>
              )}

              {!isAuthenticated && (
                <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4 text-center">
                  <p className="text-sm text-gray-400">
                    {t("review.loginToReview") || "Log in to leave a review"}
                  </p>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="mt-2">
                      {t("auth.login") || "Log In"}
                    </Button>
                  </Link>
                </div>
              )}

              <ReviewsList
                key={reviewKey}
                courseId={course.id}
                currentUserId={user?.id?.toString()}
                onEdit={(review) => {
                  setMyReview(review);
                  setIsEditingReview(true);
                }}
                onDelete={handleDeleteReview}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-gray-800 bg-gray-800/30 p-6">
                <div className="mb-4">
                  {course.price > 0 ? (
                    <div className="text-3xl font-bold text-white">
                      {course.price.toLocaleString()}{" "}
                      <span className="text-lg font-normal text-gray-500">
                        UZS
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-green-400">
                      {t("course.free") || "Free"}
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <Link
                    href={`/${teacherUsername}/${course.slug}/learn`}
                    className="block"
                  >
                    <Button className="w-full" size="lg">
                      <Play className="mr-2 h-5 w-5" />
                      {t("course.continueLearning") || "Continue Learning"}
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={isEnrolling || !isAuthenticated}
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("common.loading") || "Loading..."}
                      </>
                    ) : course.price > 0 ? (
                      t("course.enroll") || "Enroll Now"
                    ) : (
                      t("course.startLearning") || "Start Learning"
                    )}
                  </Button>
                )}
                {!isAuthenticated && (
                  <p className="mt-2 text-center text-xs text-gray-400">
                    {t("auth.loginToEnroll") || "Login to enroll"}
                  </p>
                )}

                <div className="mt-6 space-y-3 border-t border-gray-700 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t("course.modules") || "Modules"}
                    </span>
                    <span className="text-white">{course.modulesCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t("course.lessons") || "Lessons"}
                    </span>
                    <span className="text-white">{course.lessonsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t("course.duration") || "Duration"}
                    </span>
                    <span className="text-white">
                      {formatDuration(course.totalDuration)}
                    </span>
                  </div>
                  {course.averageRating > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        {t("course.rating") || "Rating"}
                      </span>
                      <span className="text-white">
                        {course.averageRating.toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
