"use client";

import * as React from "react";
import { Check, X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DragFillQuestion } from "@/types/quiz";

interface DragFillPlayerProps {
  question: DragFillQuestion;
  answers: Record<string, string>;
  onChange: (answers: Record<string, string>) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function DragFillPlayer({
  question,
  answers,
  onChange,
  disabled,
  showResult,
}: DragFillPlayerProps) {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

  const parts = question.textWithBlanks.split("___");

  const getUsedItemIds = (): string[] => {
    return Object.values(answers).filter(Boolean);
  };

  const isAnswerCorrect = (zoneId: string): boolean => {
    const zone = question.dropZones.find((z) => z.id === zoneId);
    if (!zone) return false;
    return answers[zoneId] === zone.correctItemId;
  };

  const getItemText = (itemId: string): string => {
    const item = question.items.find((i) => i.id === itemId);
    return item?.text || "";
  };

  const handleDragStart = (itemId: string) => {
    if (disabled) return;
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zoneId: string) => {
    if (disabled || !draggedItem) return;

    const existingZone = Object.entries(answers).find(
      ([_, itemId]) => itemId === draggedItem
    );
    if (existingZone) {
      const newAnswers = { ...answers };
      delete newAnswers[existingZone[0]];
      newAnswers[zoneId] = draggedItem;
      onChange(newAnswers);
    } else {
      onChange({ ...answers, [zoneId]: draggedItem });
    }
    setDraggedItem(null);
  };

  const handleRemoveFromZone = (zoneId: string) => {
    if (disabled) return;
    const newAnswers = { ...answers };
    delete newAnswers[zoneId];
    onChange(newAnswers);
  };

  const usedItemIds = getUsedItemIds();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-lg leading-loose">
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < parts.length - 1 && question.dropZones[index] && (
              <div
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(question.dropZones[index].id)}
                onClick={() =>
                  answers[question.dropZones[index].id] &&
                  handleRemoveFromZone(question.dropZones[index].id)
                }
                className={cn(
                  "inline-flex min-h-[40px] min-w-[100px] items-center justify-center rounded-lg border-2 border-dashed px-3 py-1 transition-all",
                  !disabled && "cursor-pointer",
                  answers[question.dropZones[index].id]
                    ? "border-primary bg-primary/10 border-solid"
                    : "border-muted-foreground/30",
                  showResult &&
                    isAnswerCorrect(question.dropZones[index].id) &&
                    "border-solid border-emerald-500 bg-emerald-500/10",
                  showResult &&
                    answers[question.dropZones[index].id] &&
                    !isAnswerCorrect(question.dropZones[index].id) &&
                    "border-solid border-red-500 bg-red-500/10"
                )}
              >
                {answers[question.dropZones[index].id] ? (
                  <span className="flex items-center gap-2">
                    {getItemText(answers[question.dropZones[index].id])}
                    {showResult &&
                      (isAnswerCorrect(question.dropZones[index].id) ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      ))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Drop here</span>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Available Items:</p>
        <div className="flex flex-wrap gap-2">
          {question.items.map((item) => {
            const isUsed = usedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                draggable={!disabled && !isUsed}
                onDragStart={() => handleDragStart(item.id)}
                className={cn(
                  "border-border bg-card flex cursor-grab items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                  isUsed && "cursor-not-allowed opacity-40",
                  !isUsed &&
                    !disabled &&
                    "hover:border-primary hover:bg-muted/50",
                  draggedItem === item.id && "opacity-50"
                )}
              >
                <GripHorizontal className="text-muted-foreground h-4 w-4" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {showResult && (
        <div className="border-border bg-muted/30 rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Correct Answers:</p>
          <div className="space-y-1">
            {question.dropZones.map((zone, index) => {
              const correctItem = question.items.find(
                (i) => i.id === zone.correctItemId
              );
              return (
                <p key={zone.id} className="text-sm">
                  <span className="text-muted-foreground">
                    Blank {index + 1}:
                  </span>{" "}
                  <span className="font-medium text-emerald-500">
                    {correctItem?.text || "Unknown"}
                  </span>
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
