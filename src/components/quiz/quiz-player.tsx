"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChoicePlayer } from "./players/choice-player";
import { TrueFalsePlayer } from "./players/true-false-player";
import { FillBlankPlayer } from "./players/fill-blank-player";
import { DragFillPlayer } from "./players/drag-fill-player";
import { DragDropPlayer } from "./players/drag-drop-player";
import type { Quiz, Question, QuizResult } from "@/types/quiz";

type QuestionAnswer =
  | string[]
  | boolean
  | Record<string, string>
  | Record<string, string[]>;

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (answers: Record<string, QuestionAnswer>) => Promise<QuizResult>;
  onRetake?: () => void;
}

export function QuizPlayer({ quiz, onComplete, onRetake }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, QuestionAnswer>>(
    {}
  );
  const [timeRemaining, setTimeRemaining] = React.useState<number | null>(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [showResults, setShowResults] = React.useState(false);

  const questions = React.useMemo(() => {
    let q = [...quiz.questions];
    if (quiz.shuffleQuestions) {
      q = q.sort(() => Math.random() - 0.5);
    }
    return q;
  }, [quiz.questions, quiz.shuffleQuestions]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Use ref to track if quiz should auto-submit
  const shouldAutoSubmitRef = React.useRef(false);

  // Fixed timer effect - only recreate when result changes, not on every tick
  React.useEffect(() => {
    if (timeRemaining === null || result) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) return prev;
        if (prev === 1) {
          shouldAutoSubmitRef.current = true;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]); // Only depend on result, not timeRemaining

  // Handle auto-submit when time runs out
  React.useEffect(() => {
    if (shouldAutoSubmitRef.current && timeRemaining === 0 && !result) {
      shouldAutoSubmitRef.current = false;
      handleSubmit();
    }
  }, [timeRemaining, result]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const updateAnswer = (questionId: string, answer: QuestionAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getAnswerForQuestion = (question: Question): QuestionAnswer => {
    const answer = answers[question.id];
    switch (question.type) {
      case "multiple_choice":
      case "single_choice":
        return (answer as string[]) || [];
      case "true_false":
        return answer as boolean;
      case "fill_blank":
        return (answer as Record<string, string>) || {};
      case "drag_fill":
        return (answer as Record<string, string>) || {};
      case "drag_drop":
        return (answer as Record<string, string[]>) || {};
      default:
        return [];
    }
  };

  const isQuestionAnswered = (question: Question): boolean => {
    const answer = answers[question.id];
    if (!answer) return false;

    switch (question.type) {
      case "multiple_choice":
      case "single_choice":
        return Array.isArray(answer) && answer.length > 0;
      case "true_false":
        return typeof answer === "boolean";
      case "fill_blank":
        return Object.values(answer as Record<string, string>).some(
          (v) => v.trim() !== ""
        );
      case "drag_fill":
        return Object.keys(answer as Record<string, string>).length > 0;
      case "drag_drop":
        return Object.values(answer as Record<string, string[]>).some(
          (v) => v.length > 0
        );
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const quizResult = await onComplete(answers);
      setResult(quizResult);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionPlayer = (
    question: Question,
    showResultMode: boolean
  ) => {
    const answer = getAnswerForQuestion(question);

    switch (question.type) {
      case "multiple_choice":
      case "single_choice":
        return (
          <ChoicePlayer
            question={question}
            answer={answer as string[]}
            onChange={(a) => updateAnswer(question.id, a)}
            disabled={showResultMode}
            showResult={showResultMode}
          />
        );
      case "true_false":
        return (
          <TrueFalsePlayer
            question={question}
            answer={answer as boolean | null}
            onChange={(a) => updateAnswer(question.id, a)}
            disabled={showResultMode}
            showResult={showResultMode}
          />
        );
      case "fill_blank":
        return (
          <FillBlankPlayer
            question={question}
            answers={answer as Record<string, string>}
            onChange={(a) => updateAnswer(question.id, a)}
            disabled={showResultMode}
            showResult={showResultMode}
          />
        );
      case "drag_fill":
        return (
          <DragFillPlayer
            question={question}
            answers={answer as Record<string, string>}
            onChange={(a) => updateAnswer(question.id, a)}
            disabled={showResultMode}
            showResult={showResultMode}
          />
        );
      case "drag_drop":
        return (
          <DragDropPlayer
            question={question}
            answers={answer as Record<string, string[]>}
            onChange={(a) => updateAnswer(question.id, a)}
            disabled={showResultMode}
            showResult={showResultMode}
          />
        );
      default:
        return null;
    }
  };

  if (showResults && result) {
    return (
      <div className="space-y-6">
        <Card
          className={cn(
            result.passed ? "border-emerald-500/50" : "border-red-500/50"
          )}
        >
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {result.passed ? (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
                  <Trophy className="h-10 w-10 text-emerald-500" />
                </div>
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {result.passed ? "Congratulations!" : "Keep Practicing!"}
            </CardTitle>
            <p className="text-muted-foreground">
              {result.passed
                ? "You passed the quiz!"
                : `You need ${quiz.passingScore}% to pass.`}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 text-center sm:grid-cols-3">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-3xl font-bold">
                  {Math.round(result.percentage)}%
                </p>
                <p className="text-muted-foreground text-sm">Score</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-3xl font-bold">
                  {result.earnedPoints}/{result.totalPoints}
                </p>
                <p className="text-muted-foreground text-sm">Points</p>
              </div>
              <div className="bg-muted rounded-lg p-4">
                <p className="text-3xl font-bold">
                  {result.feedback.filter((f) => f.isCorrect).length}/
                  {questions.length}
                </p>
                <p className="text-muted-foreground text-sm">Correct</p>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-3">
              {quiz.showCorrectAnswers && (
                <Button variant="outline" onClick={() => setShowResults(false)}>
                  Review Answers
                </Button>
              )}
              {quiz.allowRetake && onRetake && (
                <Button onClick={onRetake}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {!quiz.showCorrectAnswers && (
          <p className="text-muted-foreground text-center text-sm">
            Answer review is not available for this quiz.
          </p>
        )}
      </div>
    );
  }

  if (result && quiz.showCorrectAnswers) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Review Your Answers</h2>
          <Button variant="outline" onClick={() => setShowResults(true)}>
            Back to Results
          </Button>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => {
            const feedback = result.feedback.find(
              (f) => f.questionId === question.id
            );
            return (
              <Card
                key={question.id}
                className={cn(
                  feedback?.isCorrect
                    ? "border-emerald-500/30"
                    : "border-red-500/30"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                          feedback?.isCorrect
                            ? "bg-emerald-500/20 text-emerald-500"
                            : "bg-red-500/20 text-red-500"
                        )}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{question.question}</p>
                        <p className="text-muted-foreground text-sm">
                          {question.points} point
                          {question.points !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    {feedback?.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {renderQuestionPlayer(question, true)}
                  {question.explanation && (
                    <div className="mt-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                      <p className="text-sm font-medium text-blue-500">
                        Explanation:
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{quiz.title}</h2>
          {quiz.description && (
            <p className="text-muted-foreground text-sm">{quiz.description}</p>
          )}
        </div>
        {timeRemaining !== null && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2",
              timeRemaining < 60 ? "bg-red-500/20 text-red-500" : "bg-muted"
            )}
          >
            <Clock className="h-4 w-4" />
            <span className="font-mono font-medium">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {questions.map((q, index) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm transition-colors",
              currentIndex === index
                ? "bg-primary text-primary-foreground"
                : isQuestionAnswered(q)
                  ? "bg-emerald-500/20 text-emerald-500"
                  : "bg-muted hover:bg-muted/80"
            )}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          <p className="text-muted-foreground text-sm">
            {currentQuestion.points} point
            {currentQuestion.points !== 1 ? "s" : ""}
          </p>
        </CardHeader>
        <CardContent>
          {renderQuestionPlayer(currentQuestion, false)}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        ) : (
          <Button onClick={() => setCurrentIndex((i) => i + 1)}>
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
