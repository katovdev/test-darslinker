"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type {
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
  ChoiceOption,
} from "@/types/quiz";

interface ChoiceEditorProps {
  question: MultipleChoiceQuestion | SingleChoiceQuestion;
  onChange: (question: MultipleChoiceQuestion | SingleChoiceQuestion) => void;
}

export function ChoiceEditor({ question, onChange }: ChoiceEditorProps) {
  const isMultiple = question.type === "multiple_choice";

  const addOption = () => {
    const newOption: ChoiceOption = {
      id: crypto.randomUUID(),
      text: "",
      isCorrect: false,
    };
    onChange({
      ...question,
      options: [...question.options, newOption],
    });
  };

  const updateOption = (optionId: string, updates: Partial<ChoiceOption>) => {
    onChange({
      ...question,
      options: question.options.map((opt) =>
        opt.id === optionId ? { ...opt, ...updates } : opt
      ),
    });
  };

  const toggleCorrect = (optionId: string) => {
    if (isMultiple) {
      onChange({
        ...question,
        options: question.options.map((opt) =>
          opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ),
      });
    } else {
      onChange({
        ...question,
        options: question.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === optionId,
        })),
      });
    }
  };

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) return;
    onChange({
      ...question,
      options: question.options.filter((opt) => opt.id !== optionId),
    });
  };

  const correctCount = question.options.filter((o) => o.isCorrect).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          {isMultiple
            ? "Select all correct answers"
            : "Select the correct answer"}
        </p>
        {isMultiple && (
          <span className="text-muted-foreground text-xs">
            {correctCount} correct
          </span>
        )}
      </div>

      <div className="space-y-2">
        {question.options.map((option, index) => (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-2 transition-colors",
              option.isCorrect
                ? "border-emerald-500/50 bg-emerald-500/10"
                : "border-border"
            )}
          >
            <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab" />

            <button
              type="button"
              onClick={() => toggleCorrect(option.id)}
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                option.isCorrect
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-muted-foreground/30 hover:border-muted-foreground"
              )}
            >
              {option.isCorrect && <Check className="h-4 w-4" />}
            </button>

            <Input
              value={option.text}
              onChange={(e) =>
                updateOption(option.id, { text: e.target.value })
              }
              placeholder={`Option ${index + 1}`}
              className="flex-1"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeOption(option.id)}
              disabled={question.options.length <= 2}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Option
      </Button>

      {!isMultiple && correctCount === 0 && (
        <p className="text-sm text-amber-500">
          Please select the correct answer
        </p>
      )}
      {isMultiple && correctCount === 0 && (
        <p className="text-sm text-amber-500">
          Please select at least one correct answer
        </p>
      )}
    </div>
  );
}
