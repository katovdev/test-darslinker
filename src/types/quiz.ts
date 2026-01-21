export type QuestionType =
  | "multiple_choice"
  | "single_choice"
  | "true_false"
  | "fill_blank"
  | "drag_fill"
  | "drag_drop";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  order: number;
  explanation?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
}

export interface SingleChoiceQuestion extends BaseQuestion {
  type: "single_choice";
  options: ChoiceOption[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "true_false";
  correctAnswer: boolean;
}

export interface BlankItem {
  id: string;
  correctAnswer: string;
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fill_blank";
  textWithBlanks: string;
  blanks: BlankItem[];
}

export interface DragItem {
  id: string;
  text: string;
}

export interface DropZone {
  id: string;
  correctItemId: string;
  label?: string;
}

export interface DragFillQuestion extends BaseQuestion {
  type: "drag_fill";
  textWithBlanks: string;
  items: DragItem[];
  dropZones: DropZone[];
}

export interface DragDropQuestion extends BaseQuestion {
  type: "drag_drop";
  items: DragItem[];
  categories: {
    id: string;
    name: string;
    correctItemIds: string[];
  }[];
}

export type Question =
  | MultipleChoiceQuestion
  | SingleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | DragFillQuestion
  | DragDropQuestion;

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showCorrectAnswers: boolean;
  allowRetake: boolean;
  maxAttempts?: number;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | boolean | Record<string, string>;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface QuizResult {
  attempt: QuizAttempt;
  quiz: Quiz;
  totalPoints: number;
  earnedPoints: number;
  percentage: number;
  passed: boolean;
  feedback: QuestionFeedback[];
}

export interface QuestionFeedback {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: string | string[] | boolean | Record<string, string>;
  userAnswer: string | string[] | boolean | Record<string, string>;
  explanation?: string;
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  single_choice: "Single Choice",
  true_false: "True / False",
  fill_blank: "Fill in the Blanks",
  drag_fill: "Drag and Fill",
  drag_drop: "Drag and Drop",
};

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  multiple_choice: "Select multiple correct answers from options",
  single_choice: "Select one correct answer from options",
  true_false: "Determine if a statement is true or false",
  fill_blank: "Type the missing words in the blanks",
  drag_fill: "Drag words to fill in the blanks",
  drag_drop: "Drag items into correct categories",
};

export function createEmptyQuestion(
  type: QuestionType,
  order: number
): Question {
  const base = {
    id: crypto.randomUUID(),
    question: "",
    points: 1,
    order,
    explanation: "",
  };

  switch (type) {
    case "multiple_choice":
      return {
        ...base,
        type: "multiple_choice",
        options: [
          { id: crypto.randomUUID(), text: "", isCorrect: false },
          { id: crypto.randomUUID(), text: "", isCorrect: false },
        ],
      };
    case "single_choice":
      return {
        ...base,
        type: "single_choice",
        options: [
          { id: crypto.randomUUID(), text: "", isCorrect: false },
          { id: crypto.randomUUID(), text: "", isCorrect: false },
        ],
      };
    case "true_false":
      return {
        ...base,
        type: "true_false",
        correctAnswer: true,
      };
    case "fill_blank":
      return {
        ...base,
        type: "fill_blank",
        textWithBlanks: "The capital of France is ___.",
        blanks: [
          {
            id: crypto.randomUUID(),
            correctAnswer: "Paris",
            acceptableAnswers: ["paris"],
          },
        ],
      };
    case "drag_fill":
      return {
        ...base,
        type: "drag_fill",
        textWithBlanks: "The ___ is the largest planet in our solar system.",
        items: [
          { id: crypto.randomUUID(), text: "Jupiter" },
          { id: crypto.randomUUID(), text: "Saturn" },
          { id: crypto.randomUUID(), text: "Mars" },
        ],
        dropZones: [],
      };
    case "drag_drop":
      return {
        ...base,
        type: "drag_drop",
        items: [
          { id: crypto.randomUUID(), text: "Item 1" },
          { id: crypto.randomUUID(), text: "Item 2" },
        ],
        categories: [
          { id: crypto.randomUUID(), name: "Category A", correctItemIds: [] },
          { id: crypto.randomUUID(), name: "Category B", correctItemIds: [] },
        ],
      };
  }
}

export function createEmptyQuiz(
  lessonId: string
): Omit<Quiz, "id" | "createdAt" | "updatedAt"> {
  return {
    lessonId,
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: undefined,
    shuffleQuestions: false,
    shuffleOptions: false,
    showCorrectAnswers: true,
    allowRetake: true,
    maxAttempts: undefined,
    questions: [],
  };
}
