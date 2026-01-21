"use client";

import * as React from "react";
import { Check, X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DragDropQuestion } from "@/types/quiz";

interface DragDropPlayerProps {
  question: DragDropQuestion;
  answers: Record<string, string[]>;
  onChange: (answers: Record<string, string[]>) => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function DragDropPlayer({
  question,
  answers,
  onChange,
  disabled,
  showResult,
}: DragDropPlayerProps) {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

  const getPlacedItems = (): string[] => {
    return Object.values(answers).flat();
  };

  const isItemCorrectlyPlaced = (
    categoryId: string,
    itemId: string
  ): boolean => {
    const category = question.categories.find((c) => c.id === categoryId);
    return category?.correctItemIds.includes(itemId) || false;
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

  const handleDropOnCategory = (categoryId: string) => {
    if (disabled || !draggedItem) return;

    const newAnswers = { ...answers };
    Object.keys(newAnswers).forEach((catId) => {
      newAnswers[catId] = newAnswers[catId].filter((id) => id !== draggedItem);
    });

    if (!newAnswers[categoryId]) {
      newAnswers[categoryId] = [];
    }
    newAnswers[categoryId].push(draggedItem);

    onChange(newAnswers);
    setDraggedItem(null);
  };

  const handleRemoveFromCategory = (categoryId: string, itemId: string) => {
    if (disabled) return;
    onChange({
      ...answers,
      [categoryId]: (answers[categoryId] || []).filter((id) => id !== itemId),
    });
  };

  const placedItems = getPlacedItems();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium">
          Drag items to the correct category:
        </p>
        <div className="flex flex-wrap gap-2">
          {question.items.map((item) => {
            const isPlaced = placedItems.includes(item.id);
            return (
              <div
                key={item.id}
                draggable={!disabled && !isPlaced}
                onDragStart={() => handleDragStart(item.id)}
                className={cn(
                  "border-border bg-card flex cursor-grab items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                  isPlaced && "cursor-not-allowed opacity-40",
                  !isPlaced &&
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

      <div className="grid gap-4 md:grid-cols-2">
        {question.categories.map((category) => {
          const categoryItems = answers[category.id] || [];

          return (
            <div
              key={category.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnCategory(category.id)}
              className="border-border bg-card rounded-lg border"
            >
              <div className="border-border bg-muted/50 border-b p-3">
                <h4 className="font-medium">
                  {category.name || "Unnamed Category"}
                </h4>
              </div>
              <div className="min-h-[100px] p-3">
                {categoryItems.length === 0 ? (
                  <div className="border-muted-foreground/30 flex h-full min-h-[80px] items-center justify-center rounded-lg border-2 border-dashed">
                    <span className="text-muted-foreground text-sm">
                      Drop items here
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categoryItems.map((itemId) => {
                      const isCorrect = isItemCorrectlyPlaced(
                        category.id,
                        itemId
                      );
                      return (
                        <div
                          key={itemId}
                          onClick={() =>
                            handleRemoveFromCategory(category.id, itemId)
                          }
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-all",
                            !showResult &&
                              "border-primary bg-primary/10 hover:bg-primary/20",
                            showResult &&
                              isCorrect &&
                              "border-emerald-500 bg-emerald-500/10",
                            showResult &&
                              !isCorrect &&
                              "border-red-500 bg-red-500/10"
                          )}
                        >
                          <span>{getItemText(itemId)}</span>
                          {showResult &&
                            (isCorrect ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showResult && (
        <div className="border-border bg-muted/30 rounded-lg border p-3">
          <p className="mb-2 text-sm font-medium">Correct Answers:</p>
          <div className="space-y-2">
            {question.categories.map((category) => (
              <div key={category.id}>
                <span className="text-muted-foreground text-sm">
                  {category.name}:
                </span>{" "}
                <span className="text-sm font-medium text-emerald-500">
                  {category.correctItemIds
                    .map((id) => getItemText(id))
                    .join(", ") || "None"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
