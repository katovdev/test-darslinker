"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StarRating } from "@/components/ui/star-rating";
import {
  Star,
  Loader2,
  MessageSquare,
  TrendingUp,
  Send,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "@/lib/api/teacher";

interface Review {
  id: string;
  student: {
    name: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  teacherResponse?: string;
  respondedAt?: string;
}

interface ReviewsData {
  avgRating: number;
  total: number;
  pendingResponses: number;
  data: Review[];
}

export function ReviewsManagementPage() {
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "all">("all");
  const [courseFilter, setCourseFilter] = useState<string | "all">("all");
  const [responseFilter, setResponseFilter] = useState<
    "all" | "responded" | "pending"
  >("all");
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const { data } = await teacherApi.getAllReviews();
      setReviewsData(data);
    } catch (error) {
      toast.error("Sharhlarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviewsData?.data.filter((review) => {
    // Filter by rating
    if (ratingFilter !== "all" && review.rating !== ratingFilter) return false;

    // Filter by course
    if (courseFilter !== "all" && review.course.id !== courseFilter)
      return false;

    // Filter by response status
    if (responseFilter === "responded" && !review.teacherResponse) return false;
    if (responseFilter === "pending" && review.teacherResponse) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentMatch = review.student.name.toLowerCase().includes(query);
      const courseMatch = review.course.title.toLowerCase().includes(query);
      const commentMatch = review.comment.toLowerCase().includes(query);
      return studentMatch || courseMatch || commentMatch;
    }

    return true;
  });

  const uniqueCourseIds = Array.from(
    new Set(reviewsData?.data.map((r) => r.course.id))
  );
  const courseOptions = uniqueCourseIds
    .map((id) => {
      const review = reviewsData?.data.find((r) => r.course.id === id);
      return review?.course;
    })
    .filter(Boolean);

  const handleRespond = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast.error("Javob matnini kiriting");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      // await reviewsApi.respondToReview(reviewId, responseText);
      toast.success("Javob yuborildi");
      setRespondingTo(null);
      setResponseText("");
      fetchReviews();
    } catch (error) {
      toast.error("Javob yuborishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Sharhlar va reytinglar"
          subtitle="Kurslaringiz sharhlari va reytinglarini boshqarish"
        />

        {/* Stats */}
        {reviewsData && (
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="O'rtacha reyting"
              value={reviewsData.avgRating.toFixed(1)}
              icon={Star}
              color="yellow"
            />
            <StatCard
              label="Jami sharhlar"
              value={reviewsData.total}
              icon={MessageSquare}
              color="blue"
            />
            <StatCard
              label="Javob kutayotganlar"
              value={reviewsData.pendingResponses}
              icon={TrendingUp}
              color="emerald"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="border-gray-700 bg-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Response Filter */}
              <div className="flex gap-2">
                <Button
                  variant={responseFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResponseFilter("all")}
                  className={
                    responseFilter === "all"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Barchasi
                </Button>
                <Button
                  variant={responseFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setResponseFilter("pending")}
                  className={
                    responseFilter === "pending"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Javobsiz ({reviewsData?.pendingResponses || 0})
                </Button>
                <Button
                  variant={
                    responseFilter === "responded" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setResponseFilter("responded")}
                  className={
                    responseFilter === "responded"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Javob berilgan
                </Button>
              </div>

              {/* Rating Filter */}
              <select
                value={ratingFilter}
                onChange={(e) =>
                  setRatingFilter(
                    e.target.value === "all" ? "all" : parseInt(e.target.value)
                  )
                }
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">Barcha reytinglar</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} yulduzli
                  </option>
                ))}
              </select>

              {/* Course Filter */}
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="all">Barcha kurslar</option>
                {courseOptions.map((course) => (
                  <option key={course?.id} value={course?.id}>
                    {course?.title}
                  </option>
                ))}
              </select>
            </div>

            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Talaba, kurs yoki sharh matni bo'yicha qidirish..."
            />
          </div>
        </Card>

        {/* Reviews List */}
        {isLoading ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
          </Card>
        ) : !filteredReviews || filteredReviews.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Sharhlar topilmadi
            </h3>
            <p className="mt-2 text-gray-400">
              Talabalar sharhlari bu yerda ko&apos;rinadi
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <Card key={review.id} className="border-gray-700 bg-gray-800 p-6">
                {/* Review Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={review.student.avatar}
                      alt={review.student.name}
                      fallback={review.student.name}
                      className="h-12 w-12"
                    />
                    <div>
                      <p className="font-semibold text-white">
                        {review.student.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <StarRating rating={review.rating} size="sm" />
                        <span>•</span>
                        <span>{review.course.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(review.createdAt)}
                  </div>
                </div>

                {/* Review Content */}
                <p className="mb-4 text-gray-300">{review.comment}</p>

                {/* Teacher Response */}
                {review.teacherResponse && (
                  <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-emerald-400">
                        Sizning javobingiz
                      </p>
                      {review.respondedAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(review.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300">
                      {review.teacherResponse}
                    </p>
                  </div>
                )}

                {/* Response Form */}
                {!review.teacherResponse && (
                  <>
                    {respondingTo === review.id ? (
                      <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900 p-4">
                        <textarea
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Javob yozing..."
                          rows={4}
                          className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleRespond(review.id)}
                            disabled={isSubmitting || !responseText.trim()}
                            className="bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            {isSubmitting ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Javob berish
                          </Button>
                          <Button
                            onClick={() => {
                              setRespondingTo(null);
                              setResponseText("");
                            }}
                            variant="outline"
                            className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
                          >
                            Bekor qilish
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setRespondingTo(review.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Javob berish
                      </Button>
                    )}
                  </>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredReviews && filteredReviews.length > 0 && (
          <Card className="border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">
              Ko&apos;rsatilmoqda:{" "}
              <span className="font-semibold text-white">
                {filteredReviews.length}
              </span>{" "}
              sharh
              {searchQuery && " (qidiruv bo'yicha)"}
              {(ratingFilter !== "all" ||
                courseFilter !== "all" ||
                responseFilter !== "all") &&
                " (filtr qo'llanilgan)"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
