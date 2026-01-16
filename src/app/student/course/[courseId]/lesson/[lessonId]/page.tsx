"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  HelpCircle,
  File,
  Download,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { useUser } from "@/store";
import {
  courseAPI,
  type Course,
  type Lesson,
  type CourseProgress,
  type Quiz,
  type QuizAttempt,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LessonPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [quizState, setQuizState] = useState<"start" | "active" | "results">(
    "start"
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
    passed: boolean;
  } | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [courseRes, lessonRes, progressRes] = await Promise.all([
        courseAPI.getCourseById(courseId),
        courseAPI.getLessonById(courseId, lessonId),
        courseAPI.getCourseProgress(courseId).catch(() => null),
      ]);

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
      }

      if (lessonRes.success && lessonRes.data) {
        setCurrentLesson(lessonRes.data);

        // Load quiz if lesson type is quiz
        if (lessonRes.data.type === "quiz") {
          try {
            const [quizRes, attemptsRes] = await Promise.all([
              courseAPI.getQuiz(lessonId),
              user?.id
                ? courseAPI.getQuizAttempts(user.id, lessonId)
                : Promise.resolve({ success: false, data: [] }),
            ]);

            if (quizRes.success && quizRes.data) {
              setQuiz(quizRes.data);
            }
            if (attemptsRes.success && attemptsRes.data) {
              setQuizAttempts(attemptsRes.data);
            }
          } catch {
            console.error("Failed to load quiz data");
          }
        }
      } else {
        setError(t("lesson.lessonNotFound"));
      }

      if (progressRes?.success && progressRes.data) {
        setProgress(progressRes.data);
      }
    } catch (err) {
      setError(t("lesson.loadError"));
      console.error("Failed to load lesson:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, user?.id, t]);

  useEffect(() => {
    if (courseId && lessonId) {
      loadData();
    }
  }, [courseId, lessonId, loadData]);

  // Get all lessons flattened
  const getAllLessons = useCallback((): Lesson[] => {
    if (!course?.modules) return [];
    return course.modules.flatMap((m) => m.lessons || []);
  }, [course]);

  // Get current lesson index
  const getCurrentIndex = useCallback((): number => {
    const lessons = getAllLessons();
    return lessons.findIndex((l) => l._id === lessonId);
  }, [getAllLessons, lessonId]);

  // Navigation
  const getPrevLesson = useCallback((): Lesson | null => {
    const lessons = getAllLessons();
    const idx = getCurrentIndex();
    return idx > 0 ? lessons[idx - 1] : null;
  }, [getAllLessons, getCurrentIndex]);

  const getNextLesson = useCallback((): Lesson | null => {
    const lessons = getAllLessons();
    const idx = getCurrentIndex();
    return idx < lessons.length - 1 ? lessons[idx + 1] : null;
  }, [getAllLessons, getCurrentIndex]);

  const isLessonCompleted = (lid: string) => {
    return progress?.completedLessons?.includes(lid) || false;
  };

  // Mark lesson as complete
  const handleCompleteLesson = async () => {
    if (isCompleting || isLessonCompleted(lessonId)) return;

    setIsCompleting(true);
    try {
      await courseAPI.completeLesson(courseId, lessonId);
      setProgress((prev) =>
        prev
          ? {
              ...prev,
              completedLessons: [...(prev.completedLessons || []), lessonId],
            }
          : null
      );
      toast.success(t("lesson.completed"));
    } catch {
      toast.error(t("errors.generalError"));
    } finally {
      setIsCompleting(false);
    }
  };

  // Quiz handlers
  const handleStartQuiz = () => {
    setQuizState("active");
    setCurrentQuestion(0);
    setSelectedAnswers({});
  };

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || isSubmittingQuiz) return;

    setIsSubmittingQuiz(true);
    try {
      const answers = Object.entries(selectedAnswers).map(([q, a]) => ({
        questionIndex: parseInt(q),
        selectedAnswer: a,
      }));

      const response = await courseAPI.submitQuiz(lessonId, answers, 0);
      if (response.success && response.data) {
        setQuizResult({
          score: response.data.score,
          total: response.data.totalQuestions,
          passed: response.data.passed,
        });
        setQuizState("results");

        // Refresh attempts
        if (user?.id) {
          const attemptsRes = await courseAPI.getQuizAttempts(
            user.id,
            lessonId
          );
          if (attemptsRes.success) {
            setQuizAttempts(attemptsRes.data);
          }
        }

        // Mark as complete if passed
        if (response.data.passed) {
          handleCompleteLesson();
        }
      }
    } catch {
      toast.error(t("errors.generalError"));
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const prevLesson = getPrevLesson();
  const nextLesson = getNextLesson();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7EA2D4]" />
      </div>
    );
  }

  // Error state
  if (error || !currentLesson) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="rounded-full bg-red-500/10 p-4">
          <BookOpen className="h-8 w-8 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">
            {t("blog.errorTitle")}
          </h3>
          <p className="text-sm text-gray-400">
            {error || t("lesson.lessonNotFound")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
          <Button
            onClick={() => router.push(`/student/course/${courseId}`)}
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            {t("lesson.backToCourse")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <Link href={`/student/course/${courseId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("lesson.backToCourse")}
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {!isLessonCompleted(lessonId) && currentLesson.type !== "quiz" && (
            <Button
              onClick={handleCompleteLesson}
              disabled={isCompleting}
              className="bg-green-600 text-white hover:bg-green-700"
              size="sm"
            >
              {isCompleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {t("lesson.markComplete")}
            </Button>
          )}

          {isLessonCompleted(lessonId) && (
            <Badge className="bg-green-500/10 text-green-400">
              <CheckCircle className="mr-1 h-3 w-3" />
              {t("lesson.completed")}
            </Badge>
          )}
        </div>
      </div>

      {/* Lesson Title */}
      <div>
        <Badge variant="outline" className="mb-2 border-gray-700 text-gray-400">
          {t(`lesson.${currentLesson.type}`)}
        </Badge>
        <h1 className="text-2xl font-bold text-white">{currentLesson.title}</h1>
        {currentLesson.description && (
          <p className="mt-2 text-gray-400">{currentLesson.description}</p>
        )}
      </div>

      {/* Content based on type */}
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="p-6">
          {/* Video Content */}
          {currentLesson.type === "video" && currentLesson.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <video
                src={currentLesson.videoUrl}
                controls
                className="h-full w-full"
                controlsList="nodownload"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {/* Quiz Content */}
          {currentLesson.type === "quiz" && quiz && (
            <QuizContent
              quiz={quiz}
              quizState={quizState}
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              quizResult={quizResult}
              quizAttempts={quizAttempts}
              isSubmitting={isSubmittingQuiz}
              onStart={handleStartQuiz}
              onSelectAnswer={handleSelectAnswer}
              onNextQuestion={() => setCurrentQuestion((q) => q + 1)}
              onPrevQuestion={() => setCurrentQuestion((q) => q - 1)}
              onSubmit={handleSubmitQuiz}
              onRetry={handleStartQuiz}
            />
          )}

          {/* Assignment Content */}
          {currentLesson.type === "assignment" && (
            <div className="space-y-6">
              {currentLesson.instructions && (
                <div>
                  <h3 className="mb-2 font-semibold text-white">
                    {t("lesson.instructions")}
                  </h3>
                  <p className="whitespace-pre-wrap text-gray-300">
                    {currentLesson.instructions}
                  </p>
                </div>
              )}

              {currentLesson.assignmentFile && (
                <Button
                  asChild
                  className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
                >
                  <a
                    href={currentLesson.assignmentFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("lesson.download")}
                  </a>
                </Button>
              )}
            </div>
          )}

          {/* File Content */}
          {currentLesson.type === "file" && currentLesson.fileUrl && (
            <div className="flex flex-col items-center gap-4 py-8">
              <File className="h-16 w-16 text-gray-400" />
              <Button
                asChild
                className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                <a
                  href={currentLesson.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("lesson.download")}
                </a>
              </Button>
            </div>
          )}

          {/* Reading Content */}
          {currentLesson.type === "reading" && (
            <div className="prose prose-invert max-w-none">
              {currentLesson.instructions || currentLesson.description || (
                <p className="text-gray-400">{t("blog.noContent")}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Button
            asChild
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link href={`/student/course/${courseId}/lesson/${prevLesson._id}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("lesson.previousLesson")}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Button
            asChild
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            <Link href={`/student/course/${courseId}/lesson/${nextLesson._id}`}>
              {t("lesson.nextLesson")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Link href={`/student/course/${courseId}`}>
              {t("lesson.backToCourse")}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

// Quiz Component
interface QuizContentProps {
  quiz: Quiz;
  quizState: "start" | "active" | "results";
  currentQuestion: number;
  selectedAnswers: Record<number, number>;
  quizResult: { score: number; total: number; passed: boolean } | null;
  quizAttempts: QuizAttempt[];
  isSubmitting: boolean;
  onStart: () => void;
  onSelectAnswer: (questionIndex: number, answerIndex: number) => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}

function QuizContent({
  quiz,
  quizState,
  currentQuestion,
  selectedAnswers,
  quizResult,
  quizAttempts,
  isSubmitting,
  onStart,
  onSelectAnswer,
  onNextQuestion,
  onPrevQuestion,
  onSubmit,
  onRetry,
}: QuizContentProps) {
  const t = useTranslations();
  const totalQuestions = quiz.questions?.length || 0;
  const maxAttempts = quiz.maxAttempts || 3;
  const attemptsUsed = quizAttempts.length;
  const canRetry = attemptsUsed < maxAttempts;

  // Start screen
  if (quizState === "start") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <HelpCircle className="h-16 w-16 text-[#7EA2D4]" />
        <div>
          <h2 className="text-2xl font-bold text-white">{t("quiz.title")}</h2>
          <p className="mt-2 text-gray-400">
            {totalQuestions} {t("quiz.question")}
            {quiz.timeLimit && ` • ${quiz.timeLimit} ${t("course.duration")}`}
          </p>
        </div>

        {attemptsUsed > 0 && (
          <div className="text-sm text-gray-400">
            {t("quiz.attempts")}: {attemptsUsed} / {maxAttempts}
          </div>
        )}

        <Button
          onClick={onStart}
          disabled={!canRetry}
          className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
        >
          {t("quiz.startQuiz")}
        </Button>

        {/* Previous Attempts */}
        {quizAttempts.length > 0 && (
          <div className="mt-4 w-full max-w-md">
            <h3 className="mb-2 text-sm font-medium text-gray-400">
              {t("quiz.previousAttempts")}
            </h3>
            <div className="space-y-2">
              {quizAttempts.map((attempt, idx) => (
                <div
                  key={attempt._id}
                  className="flex items-center justify-between rounded-lg bg-gray-800/50 px-4 py-2 text-sm"
                >
                  <span className="text-gray-400">
                    #{idx + 1} -{" "}
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      attempt.score >= 70 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Results screen
  if (quizState === "results" && quizResult) {
    const percentage = Math.round((quizResult.score / quizResult.total) * 100);

    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div
          className={cn(
            "flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold",
            quizResult.passed
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          )}
        >
          {percentage}%
        </div>

        <div>
          <h2
            className={cn(
              "text-2xl font-bold",
              quizResult.passed ? "text-green-400" : "text-red-400"
            )}
          >
            {quizResult.passed ? t("quiz.passed") : t("quiz.failed")}
          </h2>
          <p className="mt-2 text-gray-400">
            {quizResult.score} / {quizResult.total} {t("quiz.correct")}
          </p>
        </div>

        {!quizResult.passed && canRetry && (
          <Button
            onClick={onRetry}
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            {t("quiz.tryAgain")}
          </Button>
        )}
      </div>
    );
  }

  // Active quiz
  const question = quiz.questions?.[currentQuestion];
  if (!question) return null;

  const options =
    question.options || question.answers?.map((a) => a.text) || [];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {t("quiz.question")} {currentQuestion + 1} {t("quiz.of")}{" "}
          {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <div>
        <h3 className="text-lg font-medium text-white">{question.question}</h3>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelectAnswer(currentQuestion, idx)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors",
              selectedAnswers[currentQuestion] === idx
                ? "border-[#7EA2D4] bg-[#7EA2D4]/10 text-white"
                : "border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4">
        <Button
          onClick={onPrevQuestion}
          disabled={currentQuestion === 0}
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t("blog.previous")}
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={onNextQuestion}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            {t("blog.next")}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={
              isSubmitting ||
              Object.keys(selectedAnswers).length !== totalQuestions
            }
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("quiz.submitQuiz")}
          </Button>
        )}
      </div>
    </div>
  );
}
