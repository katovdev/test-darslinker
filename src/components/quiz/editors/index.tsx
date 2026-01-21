"use client";

import * as React from "react";
import {
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ChoiceEditor } from "./choice-editor";
import { TrueFalseEditor } from "./true-false-editor";
import { FillBlankEditor } from "./fill-blank-editor";
import { DragFillEditor } from "./drag-fill-editor";
import { DragDropEditor } from "./drag-drop-editor";
import type {
  Question,
  QuestionType,
  QUESTION_TYPE_LABELS,
} from "@/types/quiz";

const QUESTION_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blanks",
  drag_fill: "Drag and Fill",
  drag_drop: "Drag and Drop",
};

interface QuestionEditorProps {
  question: Question;
  index: number;
  totalQuestions: number;
  onChange: (question: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function QuestionEditor({
  question,
  index,
  totalQuestions,
  onChange,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}: QuestionEditorProps) {
  const [isOpen, setIsOpen] = React.useState(true);
  const [showExplanation, setShowExplanation] = React.useState(
    Boolean(question.explanation)
  );

  const renderEditor = () => {
    switch (question.type) {
      case "multiple_choice":
      case "single_choice":
        return (
          <ChoiceEditor
            question={question}
            onChange={(q) => onChange(q as Question)}
          />
        );
      case "true_false":
        return (
          <TrueFalseEditor
            question={question}
            onChange={(q) => onChange(q as Question)}
          />
        );
      case "fill_blank":
        return (
          <FillBlankEditor
            question={question}
            onChange={(q) => onChange(q as Question)}
          />
        );
      case "drag_fill":
        return (
          <DragFillEditor
            question={question}
            onChange={(q) => onChange(q as Question)}
          />
        );
      case "drag_drop":
        return (
          <DragDropEditor
            question={question}
            onChange={(q) => onChange(q as Question)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border-border bg-card rounded-lg border">
        <CollapsibleTrigger asChild>
          <div className="hover:bg-muted/50 flex cursor-pointer items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">
                  {question.question || "Untitled Question"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {QUESTION_LABELS[question.type]} · {question.points} point
                  {question.points !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                disabled={index === 0}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                disabled={index === totalQuestions - 1}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate();
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-border space-y-4 border-t p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value: QuestionType) => {
                    onChange({
                      ...question,
                      type: value,
                    } as Question);
                  }}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUESTION_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Type cannot be changed after creation
                </p>
              </div>

              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={question.points}
                  onChange={(e) =>
                    onChange({
                      ...question,
                      points: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Text</Label>
              <Textarea
                value={question.question}
                onChange={(e) =>
                  onChange({ ...question, question: e.target.value })
                }
                placeholder="Enter your question here..."
                rows={2}
              />
            </div>

            {renderEditor()}

            <div className="border-border border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-muted-foreground"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                {showExplanation ? "Hide" : "Add"} Explanation
              </Button>

              {showExplanation && (
                <div className="mt-3 space-y-2">
                  <Label>Explanation (shown after answering)</Label>
                  <Textarea
                    value={question.explanation || ""}
                    onChange={(e) =>
                      onChange({ ...question, explanation: e.target.value })
                    }
                    placeholder="Explain why this answer is correct..."
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export { ChoiceEditor } from "./choice-editor";
export { TrueFalseEditor } from "./true-false-editor";
export { FillBlankEditor } from "./fill-blank-editor";
export { DragFillEditor } from "./drag-fill-editor";
export { DragDropEditor } from "./drag-drop-editor";
