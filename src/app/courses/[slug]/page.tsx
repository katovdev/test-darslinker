"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  User,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { courseAPI, type GlobalCourse } from "@/lib/api/courses";
import { reviewService, type TransformedReview } from "@/services/reviews";
import { HomeHeader, HomeFooter } from "@/components/home";
import { StarRating } from "@/components/ui/star-rating";
import { CourseRatingBadge } from "@/components/course/rating-badge";
import { RatingStats } from "@/components/course/rating-stats";
import { ReviewsList } from "@/components/course/reviews-list";
import { ReviewForm } from "@/components/course/review-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<GlobalCourse | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<TransformedReview | null>(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await courseAPI.getCourses();
        if (response.success && response.data) {
          const foundCourse = response.data.all.find((c) => c.slug === slug);
          if (foundCourse) {
            setCourse(foundCourse);
            setIsEnrolled(
              response.data.enrolled.some((c) => c.id === foundCourse.id)
            );
          } else {
            setError(t("course.courseNotFound") || "Course not found");
          }
        }
      } catch (err) {
        setError(t("course.loadError") || "Failed to load course");
        console.error("Failed to load course:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadCourse();
    }
  }, [slug]);

  useEffect(() => {
    const loadMyReview = async () => {
      if (course && isAuthenticated) {
        const response = await reviewService.getMyReview(course.id);
        if (response.success) {
          setMyReview(response.data);
        }
      }
    };

    loadMyReview();
  }, [course, isAuthenticated]);

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
          <p className="mb-6 text-gray-400">
            {error ||
              t("course.notFoundDesc") ||
              "The course you're looking for doesn't exist."}
          </p>
          <Link href="/courses">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("course.browseCourses") || "Browse Courses"}
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
          href="/courses"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("course.browseCourses") || "Back to Courses"}
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
                  <p className="font-medium text-white">
                    {course.teacher.firstName} {course.teacher.lastName}
                  </p>
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
                  <p className="text-gray-300">{course.description}</p>
                </div>
              )}
            </div>

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
                  <Button className="w-full" size="lg">
                    <Play className="mr-2 h-5 w-5" />
                    {t("course.continueLearning") || "Continue Learning"}
                  </Button>
                ) : (
                  <Button className="w-full" size="lg">
                    {course.price > 0
                      ? t("course.enroll") || "Enroll Now"
                      : t("course.startLearning") || "Start Learning"}
                  </Button>
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
                        {t("review.rating") || "Rating"}
                      </span>
                      <div className="flex items-center gap-1">
                        <StarRating rating={course.averageRating} size="sm" />
                        <span className="text-white">
                          {course.averageRating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-800/30 p-6">
                <h3 className="mb-4 font-semibold text-white">
                  {t("course.aboutTeacher") || "About the Teacher"}
                </h3>
                <div className="flex items-center gap-3">
                  {course.teacher.logoUrl ? (
                    <img
                      src={course.teacher.logoUrl}
                      alt={`${course.teacher.firstName} ${course.teacher.lastName}`}
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700">
                      <User className="h-7 w-7 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-white">
                      {course.teacher.firstName} {course.teacher.lastName}
                    </p>
                    {course.teacher.username && (
                      <p className="text-sm text-gray-400">
                        @{course.teacher.username}
                      </p>
                    )}
                  </div>
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
