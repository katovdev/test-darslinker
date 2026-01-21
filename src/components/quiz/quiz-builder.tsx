"use client";

import * as React from "react";
import {
  Plus,
  Save,
  Settings,
  Eye,
  Loader2,
  ListChecks,
  ToggleLeft,
  Type,
  GripHorizontal,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuestionEditor } from "./editors";
import type {
  Quiz,
  Question,
  QuestionType,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_DESCRIPTIONS,
} from "@/types/quiz";
import { createEmptyQuestion, createEmptyQuiz } from "@/types/quiz";

const QUESTION_TYPE_CONFIG: {
  type: QuestionType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    type: "single_choice",
    label: "Single Choice",
    description: "Select one correct answer",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    description: "Select multiple correct answers",
    icon: <ListChecks className="h-5 w-5" />,
  },
  {
    type: "true_false",
    label: "True / False",
    description: "True or false statement",
    icon: <ToggleLeft className="h-5 w-5" />,
  },
  {
    type: "fill_blank",
    label: "Fill in the Blanks",
    description: "Type missing words",
    icon: <Type className="h-5 w-5" />,
  },
  {
    type: "drag_fill",
    label: "Drag and Fill",
    description: "Drag words to blanks",
    icon: <GripHorizontal className="h-5 w-5" />,
  },
  {
    type: "drag_drop",
    label: "Drag and Drop",
    description: "Sort into categories",
    icon: <Layers className="h-5 w-5" />,
  },
];

interface QuizBuilderProps {
  lessonId: string;
  initialQuiz?: Quiz;
  onSave: (quiz: Omit<Quiz, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onPreview?: (quiz: Omit<Quiz, "id" | "createdAt" | "updatedAt">) => void;
}

export function QuizBuilder({
  lessonId,
  initialQuiz,
  onSave,
  onPreview,
}: QuizBuilderProps) {
  const [quiz, setQuiz] = React.useState<
    Omit<Quiz, "id" | "createdAt" | "updatedAt">
  >(() =>
    initialQuiz
      ? {
          lessonId: initialQuiz.lessonId,
          title: initialQuiz.title,
          description: initialQuiz.description,
          passingScore: initialQuiz.passingScore,
          timeLimit: initialQuiz.timeLimit,
          shuffleQuestions: initialQuiz.shuffleQuestions,
          shuffleOptions: initialQuiz.shuffleOptions,
          showCorrectAnswers: initialQuiz.showCorrectAnswers,
          allowRetake: initialQuiz.allowRetake,
          maxAttempts: initialQuiz.maxAttempts,
          questions: initialQuiz.questions,
        }
      : createEmptyQuiz(lessonId)
  );

  const [isSaving, setIsSaving] = React.useState(false);
  const [showAddQuestion, setShowAddQuestion] = React.useState(false);

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion = createEmptyQuestion(type, quiz.questions.length);
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setShowAddQuestion(false);
  };

  const handleUpdateQuestion = (index: number, question: Question) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i })),
    }));
  };

  const handleDuplicateQuestion = (index: number) => {
    const original = quiz.questions[index];
    const duplicate = {
      ...original,
      id: crypto.randomUUID(),
      order: quiz.questions.length,
    };
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, duplicate],
    }));
  };

  const handleMoveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= quiz.questions.length) return;

    const newQuestions = [...quiz.questions];
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    setQuiz((prev) => ({
      ...prev,
      questions: newQuestions.map((q, i) => ({ ...q, order: i })),
    }));
  };

  const handleSave = async () => {
    if (!quiz.title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }
    if (quiz.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(quiz);
      toast.success("Quiz saved successfully");
    } catch {
      toast.error("Failed to save quiz");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quiz Builder</h2>
          <p className="text-muted-foreground">
            {quiz.questions.length} question
            {quiz.questions.length !== 1 ? "s" : ""} · {totalPoints} total point
            {totalPoints !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Quiz Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input
                    value={quiz.title}
                    onChange={(e) =>
                      setQuiz((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter quiz title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={quiz.description || ""}
                    onChange={(e) =>
                      setQuiz((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the quiz"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Passing Score (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={quiz.passingScore}
                    onChange={(e) =>
                      setQuiz((prev) => ({
                        ...prev,
                        passingScore: Math.min(
                          100,
                          Math.max(0, parseInt(e.target.value) || 0)
                        ),
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Limit (minutes, optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={quiz.timeLimit || ""}
                    onChange={(e) =>
                      setQuiz((prev) => ({
                        ...prev,
                        timeLimit: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="No time limit"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Questions</Label>
                      <p className="text-muted-foreground text-xs">
                        Randomize question order
                      </p>
                    </div>
                    <Switch
                      checked={quiz.shuffleQuestions}
                      onCheckedChange={(checked: boolean) =>
                        setQuiz((prev) => ({
                          ...prev,
                          shuffleQuestions: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Shuffle Options</Label>
                      <p className="text-muted-foreground text-xs">
                        Randomize answer options
                      </p>
                    </div>
                    <Switch
                      checked={quiz.shuffleOptions}
                      onCheckedChange={(checked: boolean) =>
                        setQuiz((prev) => ({
                          ...prev,
                          shuffleOptions: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Correct Answers</Label>
                      <p className="text-muted-foreground text-xs">
                        Show answers after submission
                      </p>
                    </div>
                    <Switch
                      checked={quiz.showCorrectAnswers}
                      onCheckedChange={(checked: boolean) =>
                        setQuiz((prev) => ({
                          ...prev,
                          showCorrectAnswers: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Retake</Label>
                      <p className="text-muted-foreground text-xs">
                        Students can retry the quiz
                      </p>
                    </div>
                    <Switch
                      checked={quiz.allowRetake}
                      onCheckedChange={(checked: boolean) =>
                        setQuiz((prev) => ({ ...prev, allowRetake: checked }))
                      }
                    />
                  </div>

                  {quiz.allowRetake && (
                    <div className="space-y-2 pl-4">
                      <Label>Max Attempts (optional)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={quiz.maxAttempts || ""}
                        onChange={(e) =>
                          setQuiz((prev) => ({
                            ...prev,
                            maxAttempts: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          }))
                        }
                        placeholder="Unlimited"
                      />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreview(quiz)}
              disabled={quiz.questions.length === 0}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Quiz
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {quiz.title || "Untitled Quiz"}
            </CardTitle>
            {!quiz.title && (
              <span className="text-sm text-amber-500">
                Open settings to add a title
              </span>
            )}
          </div>
          {quiz.description && (
            <p className="text-muted-foreground text-sm">{quiz.description}</p>
          )}
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            totalQuestions={quiz.questions.length}
            onChange={(q) => handleUpdateQuestion(index, q)}
            onDelete={() => handleDeleteQuestion(index)}
            onDuplicate={() => handleDuplicateQuestion(index)}
            onMoveUp={() => handleMoveQuestion(index, "up")}
            onMoveDown={() => handleMoveQuestion(index, "down")}
          />
        ))}

        {quiz.questions.length === 0 && (
          <div className="border-border flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12">
            <div className="bg-muted mb-4 rounded-full p-3">
              <ListChecks className="text-muted-foreground h-6 w-6" />
            </div>
            <h3 className="mb-1 font-medium">No questions yet</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Add your first question to get started
            </p>
          </div>
        )}

        <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choose Question Type</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3 py-4 sm:grid-cols-2">
              {QUESTION_TYPE_CONFIG.map((config) => (
                <button
                  key={config.type}
                  onClick={() => handleAddQuestion(config.type)}
                  className="border-border hover:border-primary hover:bg-muted/50 flex items-start gap-3 rounded-lg border p-4 text-left transition-colors"
                >
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-medium">{config.label}</p>
                    <p className="text-muted-foreground text-sm">
                      {config.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
