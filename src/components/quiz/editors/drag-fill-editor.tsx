"use client";

import * as React from "react";
import { Plus, Trash2, Info, GripVertical } from "lucide-react";
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
import type { DragFillQuestion, DragItem, DropZone } from "@/types/quiz";

interface DragFillEditorProps {
  question: DragFillQuestion;
  onChange: (question: DragFillQuestion) => void;
}

export function DragFillEditor({ question, onChange }: DragFillEditorProps) {
  const [showHelp, setShowHelp] = React.useState(false);

  const blankCount = (question.textWithBlanks.match(/___/g) || []).length;

  React.useEffect(() => {
    const currentZones = question.dropZones.length;
    if (blankCount > currentZones) {
      const newZones: DropZone[] = [];
      for (let i = currentZones; i < blankCount; i++) {
        newZones.push({
          id: crypto.randomUUID(),
          correctItemId: "",
          label: `Blank ${i + 1}`,
        });
      }
      onChange({
        ...question,
        dropZones: [...question.dropZones, ...newZones],
      });
    } else if (blankCount < currentZones) {
      onChange({
        ...question,
        dropZones: question.dropZones.slice(0, blankCount),
      });
    }
  }, [blankCount, question, onChange]);

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
      dropZones: question.dropZones.map((zone) =>
        zone.correctItemId === itemId ? { ...zone, correctItemId: "" } : zone
      ),
    });
  };

  const updateDropZone = (zoneId: string, correctItemId: string) => {
    onChange({
      ...question,
      dropZones: question.dropZones.map((zone) =>
        zone.id === zoneId ? { ...zone, correctItemId } : zone
      ),
    });
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
          How to create drag and fill
        </button>
        {showHelp && (
          <p className="text-muted-foreground mt-2 text-sm">
            1. Write text with blanks using three underscores (___).
            <br />
            2. Add draggable items (including correct answers and distractors).
            <br />
            3. Assign the correct item for each blank.
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
          placeholder="The ___ is the largest planet. ___ is the red planet."
          rows={3}
        />
        <p className="text-muted-foreground text-xs">
          {blankCount} blank{blankCount !== 1 ? "s" : ""} detected
        </p>
      </div>

      <div className="space-y-2">
        <Label>Draggable Items</Label>
        <p className="text-muted-foreground text-xs">
          Add all items including correct answers and distractors
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

      {question.dropZones.length > 0 && (
        <div className="space-y-2">
          <Label>Correct answers for each blank</Label>
          {question.dropZones.map((zone, index) => (
            <div
              key={zone.id}
              className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
            >
              <span className="shrink-0 text-sm font-medium">
                Blank {index + 1}
              </span>
              <Select
                value={zone.correctItemId}
                onValueChange={(value) => updateDropZone(zone.id, value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select correct item" />
                </SelectTrigger>
                <SelectContent>
                  {question.items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.text || "(empty)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {blankCount === 0 && (
        <p className="text-sm text-amber-500">
          Add at least one blank using three underscores (___)
        </p>
      )}
      {question.items.length === 0 && (
        <p className="text-sm text-amber-500">
          Add at least one draggable item
        </p>
      )}
    </div>
  );
}
