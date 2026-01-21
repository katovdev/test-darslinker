"use client";

import * as React from "react";
import { Plus, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FillBlankQuestion, BlankItem } from "@/types/quiz";

interface FillBlankEditorProps {
  question: FillBlankQuestion;
  onChange: (question: FillBlankQuestion) => void;
}

export function FillBlankEditor({ question, onChange }: FillBlankEditorProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  const blankCount = (question.textWithBlanks.match(/___/g) || []).length;

  React.useEffect(() => {
    const currentBlanks = question.blanks.length;
    if (blankCount > currentBlanks) {
      const newBlanks: BlankItem[] = [];
      for (let i = currentBlanks; i < blankCount; i++) {
        newBlanks.push({
          id: crypto.randomUUID(),
          correctAnswer: "",
          acceptableAnswers: [],
          caseSensitive: false,
        });
      }
      onChange({
        ...question,
        blanks: [...question.blanks, ...newBlanks],
      });
    } else if (blankCount < currentBlanks) {
      onChange({
        ...question,
        blanks: question.blanks.slice(0, blankCount),
      });
    }
  }, [blankCount, question, onChange]);

  const updateBlank = (index: number, updates: Partial<BlankItem>) => {
    onChange({
      ...question,
      blanks: question.blanks.map((blank, i) =>
        i === index ? { ...blank, ...updates } : blank
      ),
    });
  };

  const parseAcceptableAnswers = (value: string): string[] => {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
        <button
          type="button"
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-sm text-blue-400"
        >
          <Info className="h-4 w-4" />
          How to create blanks
        </button>
        {showHelp && (
          <p className="text-muted-foreground mt-2 text-sm">
            Use three underscores (
            <code className="bg-muted rounded px-1">___</code>) to create a
            blank. For example: &quot;The capital of France is ___.&quot;
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Text with blanks</Label>
        <Textarea
          value={question.textWithBlanks}
          onChange={(e) =>
            onChange({ ...question, textWithBlanks: e.target.value })
          }
          placeholder="The capital of ___ is Paris. It is located in ___."
          rows={3}
        />
        <p className="text-muted-foreground text-xs">
          {blankCount} blank{blankCount !== 1 ? "s" : ""} detected
        </p>
      </div>

      {question.blanks.length > 0 && (
        <div className="space-y-3">
          <Label>Answers for each blank</Label>
          {question.blanks.map((blank, index) => (
            <div
              key={blank.id}
              className="border-border bg-muted/30 rounded-lg border p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Blank {index + 1}</span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`case-${blank.id}`}
                    checked={blank.caseSensitive}
                    onCheckedChange={(checked) =>
                      updateBlank(index, { caseSensitive: checked === true })
                    }
                  />
                  <Label
                    htmlFor={`case-${blank.id}`}
                    className="text-muted-foreground text-xs"
                  >
                    Case sensitive
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  value={blank.correctAnswer}
                  onChange={(e) =>
                    updateBlank(index, { correctAnswer: e.target.value })
                  }
                  placeholder="Correct answer"
                />
                <Input
                  value={blank.acceptableAnswers?.join(", ") || ""}
                  onChange={(e) =>
                    updateBlank(index, {
                      acceptableAnswers: parseAcceptableAnswers(e.target.value),
                    })
                  }
                  placeholder="Alternative answers (comma separated)"
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {blankCount === 0 && (
        <p className="text-sm text-amber-500">
          Add at least one blank using three underscores (___)
        </p>
      )}
    </div>
  );
}
