"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  FileText,
  HelpCircle,
  File,
  Download,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "@/hooks/use-locale";
import {
  studentAPI,
  type StudentLessonDetail,
  type StudentCourse,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LessonPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<StudentLessonDetail | null>(null);
  const [course, setCourse] = useState<StudentCourse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Quiz state
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
      const [lessonRes, courseRes] = await Promise.all([
        studentAPI.getLessonById(lessonId),
        studentAPI.getCourseById(courseId),
      ]);

      if (lessonRes.success && lessonRes.data) {
        setLesson(lessonRes.data);
      } else {
        setError(t("lesson.lessonNotFound"));
      }

      if (courseRes.success && courseRes.data) {
        setCourse(courseRes.data);
      }
    } catch (err) {
      setError(t("lesson.loadError"));
      console.error("Failed to load lesson:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, lessonId, t]);

  useEffect(() => {
    if (courseId && lessonId) {
      loadData();
    }
  }, [courseId, lessonId, loadData]);

  // Mark lesson as complete
  const handleCompleteLesson = async () => {
    if (isCompleting || lesson?.isCompleted) return;

    setIsCompleting(true);
    try {
      const response = await studentAPI.completeLesson(lessonId);
      if (response.success) {
        setLesson((prev) => (prev ? { ...prev, isCompleted: true } : null));
        toast.success(t("lesson.completed"));
      }
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
    setQuizResult(null);
  };

  const handleSelectAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!lesson?.quiz || isSubmittingQuiz) return;

    setIsSubmittingQuiz(true);
    try {
      // Calculate score locally (backend should also validate)
      const questions = lesson.quiz.questions;
      let correctCount = 0;

      // For now, simulate quiz submission
      // In real implementation, this would call an API endpoint
      const totalQuestions = questions.length;
      const answeredAll =
        Object.keys(selectedAnswers).length === totalQuestions;

      if (!answeredAll) {
        toast.error(t("quiz.noAttempts"));
        setIsSubmittingQuiz(false);
        return;
      }

      // Simulate result (in real app, backend validates answers)
      const passedScore = Math.floor(totalQuestions * 0.7);
      const simulatedScore = Math.floor(Math.random() * totalQuestions) + 1;

      setQuizResult({
        score: simulatedScore,
        total: totalQuestions,
        passed: simulatedScore >= passedScore,
      });
      setQuizState("results");

      // Mark as complete if passed
      if (simulatedScore >= passedScore) {
        handleCompleteLesson();
      }
    } catch {
      toast.error(t("errors.generalError"));
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7EA2D4]" />
      </div>
    );
  }

  // Error state
  if (error || !lesson) {
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
          {!lesson.isCompleted && lesson.type !== "quiz" && (
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

          {lesson.isCompleted && (
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
          {t(`lesson.${lesson.type}`)}
        </Badge>
        <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>
        {lesson.description && (
          <p className="mt-2 text-gray-400">{lesson.description}</p>
        )}
      </div>

      {/* Content based on type */}
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="p-6">
          {/* Video Content */}
          {lesson.type === "video" && lesson.videoUrl && (
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <video
                src={lesson.videoUrl}
                controls
                className="h-full w-full"
                controlsList="nodownload"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {/* Text Content */}
          {lesson.type === "text" && lesson.content && (
            <div className="prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: lesson.content }}
                className="text-gray-300"
              />
            </div>
          )}

          {/* Quiz Content */}
          {lesson.type === "quiz" && lesson.quiz && (
            <QuizContent
              quiz={lesson.quiz}
              quizState={quizState}
              currentQuestion={currentQuestion}
              selectedAnswers={selectedAnswers}
              quizResult={quizResult}
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
          {lesson.type === "assignment" && (
            <div className="space-y-6">
              {lesson.content && (
                <div>
                  <h3 className="mb-2 font-semibold text-white">
                    {t("lesson.instructions")}
                  </h3>
                  <div
                    className="whitespace-pre-wrap text-gray-300"
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </div>
              )}

              {lesson.attachments && lesson.attachments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-white">
                    {t("lesson.file")}
                  </h3>
                  {lesson.attachments.map((attachment, index) => (
                    <Button
                      key={index}
                      asChild
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {attachment.name}
                      </a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attachments (for any lesson type) */}
      {lesson.attachments &&
        lesson.attachments.length > 0 &&
        lesson.type !== "assignment" && (
          <Card className="border-gray-800 bg-gray-800/30">
            <CardContent className="p-6">
              <h3 className="mb-4 font-semibold text-white">
                {t("lesson.file")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.attachments.map((attachment, index) => (
                  <Button
                    key={index}
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <a
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {attachment.name}
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {lesson.prevLesson ? (
          <Button
            asChild
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Link
              href={`/student/course/${courseId}/lesson/${lesson.prevLesson.id}`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("lesson.previousLesson")}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {lesson.nextLesson ? (
          <Button
            asChild
            className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            <Link
              href={`/student/course/${courseId}/lesson/${lesson.nextLesson.id}`}
            >
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
  quiz: {
    id: string;
    questions: {
      id: string;
      question: string;
      options: string[];
    }[];
    timeLimit: number | null;
    passingScore: number;
  };
  quizState: "start" | "active" | "results";
  currentQuestion: number;
  selectedAnswers: Record<number, number>;
  quizResult: { score: number; total: number; passed: boolean } | null;
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

  // Start screen
  if (quizState === "start") {
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <HelpCircle className="h-16 w-16 text-[#7EA2D4]" />
        <div>
          <h2 className="text-2xl font-bold text-white">{t("quiz.title")}</h2>
          <p className="mt-2 text-gray-400">
            {totalQuestions} {t("quiz.question")}
            {quiz.timeLimit && ` • ${quiz.timeLimit} min`}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {t("quiz.score")}: {quiz.passingScore}%
          </p>
        </div>

        <Button
          onClick={onStart}
          className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
        >
          {t("quiz.startQuiz")}
        </Button>
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

        {!quizResult.passed && (
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
        {question.options.map((option, idx) => (
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
