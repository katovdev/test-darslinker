"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FillBlankQuestion } from "@/types/quiz";

interface FillBlankPlayerProps {
  question: FillBlankQuestion;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function FillBlankPlayer({
  question,
  answers,
  onChange,
  disabled,
  showResult,
}: FillBlankPlayerProps) {
  const parts = question.textWithBlanks.split("___");

  const isAnswerCorrect = (blankId: string, answer: string): boolean => {
    const blank = question.blanks.find((b) => b.id === blankId);
    if (!blank) return false;

    const userAnswer = blank.caseSensitive ? answer : answer.toLowerCase();
    const correctAnswer = blank.caseSensitive
      ? blank.correctAnswer
      : blank.correctAnswer.toLowerCase();
    const acceptableAnswers = (blank.acceptableAnswers || []).map((a) =>
      blank.caseSensitive ? a : a.toLowerCase()
    );

    return (
      userAnswer === correctAnswer || acceptableAnswers.includes(userAnswer)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-lg leading-relaxed">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && question.blanks[index] && (
              <div className="relative inline-flex items-center">
                <Input
                  value={answers[question.blanks[index].id] || ""}
                  onChange={(e) =>
                    onChange({
                      ...answers,
                      [question.blanks[index].id]: e.target.value,
                    })
                  }
                  disabled={disabled}
                  className={cn(
                    "inline-block h-9 w-32 text-center",
                    showResult &&
                      isAnswerCorrect(
                        question.blanks[index].id,
                        answers[question.blanks[index].id] || ""
                      ) &&
                      "border-emerald-500 bg-emerald-500/10",
                    showResult &&
                      !isAnswerCorrect(
                        question.blanks[index].id,
                        answers[question.blanks[index].id] || ""
                      ) &&
                      "border-red-500 bg-red-500/10"
                  )}
                  placeholder={`Blank ${index + 1}`}
                />
                {showResult && (
                  <span className="absolute top-1/2 -right-6 -translate-y-1/2">
                    {isAnswerCorrect(
                      question.blanks[index].id,
                      answers[question.blanks[index].id] || ""
                    ) ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {showResult && (
        <div className="border-border bg-muted/30 rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Correct Answers:</p>
          <div className="space-y-1">
            {question.blanks.map((blank, index) => (
              <p key={blank.id} className="text-sm">
                <span className="text-muted-foreground">
                  Blank {index + 1}:
                </span>{" "}
                <span className="font-medium text-emerald-500">
                  {blank.correctAnswer}
                </span>
                {blank.acceptableAnswers &&
                  blank.acceptableAnswers.length > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      (also accepted: {blank.acceptableAnswers.join(", ")})
                    </span>
                  )}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
