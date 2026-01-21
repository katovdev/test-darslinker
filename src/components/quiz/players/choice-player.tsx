"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
} from "@/types/quiz";

interface ChoicePlayerProps {
  question: MultipleChoiceQuestion | SingleChoiceQuestion;
  answer: string[];
  onChange: (answer: string[]) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function ChoicePlayer({
  question,
  answer,
  onChange,
  disabled,
  showResult,
}: ChoicePlayerProps) {
  const isMultiple = question.type === "multiple_choice";

  const toggleOption = (optionId: string) => {
    if (disabled) return;

    if (isMultiple) {
      if (answer.includes(optionId)) {
        onChange(answer.filter((id) => id !== optionId));
      } else {
        onChange([...answer, optionId]);
      }
    } else {
      onChange([optionId]);
    }
  };

  return (
    <div className="space-y-2">
      {question.options.map((option) => {
        const isSelected = answer.includes(option.id);
        const isCorrect = option.isCorrect;
        const showCorrectness = showResult && (isSelected || isCorrect);

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => toggleOption(option.id)}
            disabled={disabled}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
              !showResult &&
                !disabled &&
                "hover:border-primary/50 hover:bg-muted/50",
              !showResult && isSelected && "border-primary bg-primary/10",
              !showResult && !isSelected && "border-border",
              showResult && isCorrect && "border-emerald-500 bg-emerald-500/10",
              showResult &&
                isSelected &&
                !isCorrect &&
                "border-red-500 bg-red-500/10",
              showResult &&
                !isSelected &&
                !isCorrect &&
                "border-border opacity-50",
              disabled && !showResult && "cursor-not-allowed opacity-50"
            )}
          >
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                isMultiple ? "rounded-md" : "rounded-full",
                !showResult &&
                  isSelected &&
                  "border-primary bg-primary text-primary-foreground",
                !showResult && !isSelected && "border-muted-foreground/30",
                showResult &&
                  isCorrect &&
                  "border-emerald-500 bg-emerald-500 text-white",
                showResult &&
                  isSelected &&
                  !isCorrect &&
                  "border-red-500 bg-red-500 text-white"
              )}
            >
              {showResult && isCorrect && <Check className="h-4 w-4" />}
              {showResult && isSelected && !isCorrect && (
                <X className="h-4 w-4" />
              )}
              {!showResult && isSelected && <Check className="h-4 w-4" />}
            </div>
            <span className="flex-1">{option.text}</span>
            {showCorrectness && (
              <span
                className={cn(
                  "text-sm font-medium",
                  isCorrect ? "text-emerald-500" : "text-red-500"
                )}
              >
                {isCorrect ? "Correct" : "Incorrect"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
