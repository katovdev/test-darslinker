"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrueFalseQuestion } from "@/types/quiz";

interface TrueFalsePlayerProps {
  question: TrueFalseQuestion;
  answer: boolean | null;
  onChange: (answer: boolean) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function TrueFalsePlayer({
  question,
  answer,
  onChange,
  disabled,
  showResult,
}: TrueFalsePlayerProps) {
  const getButtonClasses = (value: boolean) => {
    const isSelected = answer === value;
    const isCorrect = question.correctAnswer === value;
    const isSelectedCorrect = isSelected && isCorrect;
    const isSelectedIncorrect = isSelected && !isCorrect;

    return cn(
      "flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border-2 p-6 transition-all",
      !showResult && !disabled && "hover:border-primary/50 hover:bg-muted/50",
      !showResult && isSelected && "border-primary bg-primary/10",
      !showResult && !isSelected && "border-border",
      showResult && isSelectedCorrect && "border-emerald-500 bg-emerald-500/10",
      showResult && isSelectedIncorrect && "border-red-500 bg-red-500/10",
      showResult &&
        !isSelected &&
        isCorrect &&
        "border-emerald-500 bg-emerald-500/10",
      showResult && !isSelected && !isCorrect && "border-border opacity-50",
      disabled && !showResult && "cursor-not-allowed opacity-50"
    );
  };

  const getIconClasses = (value: boolean) => {
    const isSelected = answer === value;
    const isCorrect = question.correctAnswer === value;

    return cn(
      "flex h-14 w-14 items-center justify-center rounded-full transition-colors",
      !showResult && isSelected && value && "bg-emerald-500 text-white",
      !showResult && isSelected && !value && "bg-red-500 text-white",
      !showResult && !isSelected && "bg-muted",
      showResult && isCorrect && "bg-emerald-500 text-white",
      showResult && isSelected && !isCorrect && "bg-red-500 text-white",
      showResult && !isSelected && !isCorrect && "bg-muted"
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => !disabled && onChange(true)}
        disabled={disabled}
        className={getButtonClasses(true)}
      >
        <div className={getIconClasses(true)}>
          <Check className="h-8 w-8" />
        </div>
        <span className="text-lg font-medium">True</span>
        {showResult && question.correctAnswer === true && (
          <span className="text-sm text-emerald-500">Correct Answer</span>
        )}
      </button>

      <button
        type="button"
        onClick={() => !disabled && onChange(false)}
        disabled={disabled}
        className={getButtonClasses(false)}
      >
        <div className={getIconClasses(false)}>
          <X className="h-8 w-8" />
        </div>
        <span className="text-lg font-medium">False</span>
        {showResult && question.correctAnswer === false && (
          <span className="text-sm text-emerald-500">Correct Answer</span>
        )}
      </button>
    </div>
  );
}
