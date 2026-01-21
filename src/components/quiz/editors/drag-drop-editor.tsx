"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { DragDropQuestion, DragItem } from "@/types/quiz";

interface DragDropEditorProps {
  question: DragDropQuestion;
  onChange: (question: DragDropQuestion) => void;
}

export function DragDropEditor({ question, onChange }: DragDropEditorProps) {
  const addItem = () => {
    const newItem: DragItem = {
      id: crypto.randomUUID(),
      text: "",
    };
    onChange({
      ...question,
      items: [...question.items, newItem],
    });
  };

  const updateItem = (itemId: string, text: string) => {
    onChange({
      ...question,
      items: question.items.map((item) =>
        item.id === itemId ? { ...item, text } : item
      ),
    });
  };

  const removeItem = (itemId: string) => {
    onChange({
      ...question,
      items: question.items.filter((item) => item.id !== itemId),
      categories: question.categories.map((cat) => ({
        ...cat,
        correctItemIds: cat.correctItemIds.filter((id) => id !== itemId),
      })),
    });
  };

  const addCategory = () => {
    onChange({
      ...question,
      categories: [
        ...question.categories,
        {
          id: crypto.randomUUID(),
          name: "",
          correctItemIds: [],
        },
      ],
    });
  };

  const updateCategoryName = (categoryId: string, name: string) => {
    onChange({
      ...question,
      categories: question.categories.map((cat) =>
        cat.id === categoryId ? { ...cat, name } : cat
      ),
    });
  };

  const removeCategory = (categoryId: string) => {
    if (question.categories.length <= 2) return;
    onChange({
      ...question,
      categories: question.categories.filter((cat) => cat.id !== categoryId),
    });
  };

  const toggleItemInCategory = (categoryId: string, itemId: string) => {
    onChange({
      ...question,
      categories: question.categories.map((cat) => {
        if (cat.id === categoryId) {
          const hasItem = cat.correctItemIds.includes(itemId);
          return {
            ...cat,
            correctItemIds: hasItem
              ? cat.correctItemIds.filter((id) => id !== itemId)
              : [...cat.correctItemIds, itemId],
          };
        }
        return {
          ...cat,
          correctItemIds: cat.correctItemIds.filter((id) => id !== itemId),
        };
      }),
    });
  };

  const getItemCategory = (itemId: string): string | null => {
    for (const cat of question.categories) {
      if (cat.correctItemIds.includes(itemId)) {
        return cat.id;
      }
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Draggable Items</Label>
        <p className="text-muted-foreground text-xs">
          Create items that students will drag into categories
        </p>
        <div className="space-y-2">
          {question.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <GripVertical className="text-muted-foreground h-4 w-4 shrink-0" />
              <Input
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder="Item text"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeItem(item.id)}
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
          onClick={addItem}
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Categories</Label>
        <p className="text-muted-foreground text-xs">
          Define categories and assign correct items to each
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {question.categories.map((category) => (
            <div
              key={category.id}
              className="border-border bg-muted/30 rounded-lg border p-3"
            >
              <div className="mb-3 flex items-center gap-2">
                <Input
                  value={category.name}
                  onChange={(e) =>
                    updateCategoryName(category.id, e.target.value)
                  }
                  placeholder="Category name"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeCategory(category.id)}
                  disabled={question.categories.length <= 2}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">
                  Items in this category:
                </p>
                {question.items.length === 0 ? (
                  <p className="text-muted-foreground text-xs italic">
                    Add items first
                  </p>
                ) : (
                  <div className="space-y-1">
                    {question.items.map((item) => {
                      const itemCategory = getItemCategory(item.id);
                      const isInThisCategory = itemCategory === category.id;
                      const isInOtherCategory =
                        itemCategory !== null && itemCategory !== category.id;

                      return (
                        <label
                          key={item.id}
                          className={cn(
                            "flex cursor-pointer items-center gap-2 rounded p-1.5 text-sm transition-colors",
                            isInThisCategory && "bg-emerald-500/20",
                            isInOtherCategory && "opacity-40"
                          )}
                        >
                          <Checkbox
                            checked={isInThisCategory}
                            onCheckedChange={() =>
                              toggleItemInCategory(category.id, item.id)
                            }
                            disabled={isInOtherCategory}
                          />
                          <span
                            className={cn(
                              !item.text && "text-muted-foreground italic"
                            )}
                          >
                            {item.text || "(empty)"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addCategory}
          className="w-full"
        >
          <FolderPlus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {question.items.length === 0 && (
        <p className="text-sm text-amber-500">
          Add at least one draggable item
        </p>
      )}
      {question.categories.some((c) => c.correctItemIds.length === 0) && (
        <p className="text-sm text-amber-500">
          Each category should have at least one correct item
        </p>
      )}
    </div>
  );
}
