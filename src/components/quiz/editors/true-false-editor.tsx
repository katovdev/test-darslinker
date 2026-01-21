"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrueFalseQuestion } from "@/types/quiz";

interface TrueFalseEditorProps {
  question: TrueFalseQuestion;
  onChange: (question: TrueFalseQuestion) => void;
}

export function TrueFalseEditor({ question, onChange }: TrueFalseEditorProps) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">
        Select the correct answer for this statement
      </p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange({ ...question, correctAnswer: true })}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 transition-all",
            question.correctAnswer
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
              : "border-border hover:border-muted-foreground"
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              question.correctAnswer ? "bg-emerald-500 text-white" : "bg-muted"
            )}
          >
            <Check className="h-6 w-6" />
          </div>
          <span className="text-lg font-medium">True</span>
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...question, correctAnswer: false })}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-6 transition-all",
            !question.correctAnswer
              ? "border-red-500 bg-red-500/10 text-red-500"
              : "border-border hover:border-muted-foreground"
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              !question.correctAnswer ? "bg-red-500 text-white" : "bg-muted"
            )}
          >
            <X className="h-6 w-6" />
          </div>
          <span className="text-lg font-medium">False</span>
        </button>
      </div>
    </div>
  );
}
