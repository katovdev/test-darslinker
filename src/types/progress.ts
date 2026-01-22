// Progress Tracking Types
// Hierarchical structure: Course > Module > Lesson
// Uses denormalized counts for fast queries: { total: X, completed: Y }

export interface ProgressCount {
  total: number;
  completed: number;
}

export interface ProgressPercentage {
  count: ProgressCount;
  percentage: number; // 0-100
}

// Lesson-level progress (most granular)
export interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  // Content progress within the lesson
  videoProgress?: {
    watchedSeconds: number;
    totalSeconds: number;
    percentage: number;
    lastPosition: number;
  };
  quizProgress?: {
    attempts: number;
    bestScore: number;
    passed: boolean;
    lastAttemptAt?: string;
  };
  readingProgress?: {
    scrollPercentage: number;
    completedAt?: string;
  };
  assignmentProgress?: {
    submitted: boolean;
    submittedAt?: string;
    graded: boolean;
    gradedAt?: string;
    score?: number;
    maxScore?: number;
    feedback?: string;
    status: "not_submitted" | "submitted" | "graded" | "resubmit_requested";
  };
  fileProgress?: {
    viewed: boolean;
    viewedAt?: string;
    downloaded: boolean;
    downloadedAt?: string;
  };
  // Time spent on this lesson
  timeSpentSeconds: number;
  lastAccessedAt: string;
}

// Module-level progress (aggregates lessons)
export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  lessons: ProgressCount;
  startedAt?: string;
  completedAt?: string;
  // Aggregated time
  timeSpentSeconds: number;
  lastAccessedAt: string;
}

// Course-level progress (aggregates modules)
export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  userId: string;
  status: "not_started" | "in_progress" | "completed";
  modules: ProgressCount;
  lessons: ProgressCount; // Total lessons across all modules
  startedAt?: string;
  completedAt?: string;
  // Certificate if completed
  certificateId?: string;
  certificateIssuedAt?: string;
  // Aggregated time
  timeSpentSeconds: number;
  lastAccessedAt: string;
}

// Full progress tree for detailed view
export interface CourseProgressDetail extends CourseProgress {
  moduleDetails: (ModuleProgress & {
    lessonDetails: LessonProgress[];
  })[];
}

// Student overview across all courses
export interface StudentOverview {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  enrolledCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpentSeconds: number;
  lastActiveAt: string;
  averageQuizScore: number;
  coursesProgress: CourseProgress[];
}

// Teacher analytics dashboard types
export interface CourseAnalytics {
  courseId: string;
  courseTitle: string;
  // Enrollment stats
  totalEnrollments: number;
  activeStudents: number; // Accessed in last 7 days
  completionRate: number; // Percentage of students who completed
  // Progress distribution
  progressDistribution: {
    notStarted: number;
    inProgress: number;
    completed: number;
  };
  // Average metrics
  averageProgress: number; // Average completion percentage
  averageTimeToComplete: number; // Seconds
  averageQuizScore: number;
  // Module breakdown
  moduleAnalytics: ModuleAnalytics[];
}

export interface ModuleAnalytics {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  // Completion
  completionRate: number;
  averageTimeSpent: number;
  // Drop-off indicator (students who stopped here)
  dropOffRate: number;
  // Lesson breakdown
  lessonAnalytics: LessonAnalytics[];
}

export interface LessonAnalytics {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  lessonType: "video" | "text" | "quiz" | "mixed" | "assignment" | "file";
  // Completion
  completionRate: number;
  averageTimeSpent: number;
  // Type-specific metrics
  videoMetrics?: {
    averageWatchPercentage: number;
    completionRate: number;
    averageReplays: number;
  };
  quizMetrics?: {
    averageScore: number;
    passRate: number;
    averageAttempts: number;
    questionDifficulty: {
      questionId: string;
      questionText: string;
      correctRate: number;
    }[];
  };
  assignmentMetrics?: {
    submissionRate: number;
    averageGrade: number;
    gradedRate: number;
    averageTimeToSubmit: number; // seconds
  };
  fileMetrics?: {
    viewRate: number;
    downloadRate: number;
  };
}

// Time-series data for charts
export interface ProgressTimeSeries {
  date: string;
  enrollments: number;
  completions: number;
  activeUsers: number;
  averageProgress: number;
}

export interface EngagementMetrics {
  period: "day" | "week" | "month";
  data: {
    date: string;
    totalViews: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    lessonsStarted: number;
    lessonsCompleted: number;
    quizzesAttempted: number;
    quizzesPassed: number;
  }[];
}

// Progress events for real-time tracking
export type ProgressEventType =
  | "lesson_started"
  | "lesson_completed"
  | "video_progress"
  | "quiz_attempt"
  | "quiz_passed"
  | "module_completed"
  | "course_completed"
  | "certificate_issued";

export interface ProgressEvent {
  id: string;
  type: ProgressEventType;
  userId: string;
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Filters for analytics queries
export interface ProgressFilters {
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  userId?: string;
  status?: ("not_started" | "in_progress" | "completed")[];
  dateRange?: {
    start: string;
    end: string;
  };
  sortBy?: "name" | "progress" | "lastActive" | "enrolledAt";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AnalyticsSummary {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  averageCompletionRate: number;
  totalTimeSpent: number;
  recentActivity: ProgressEvent[];
}

// Helper functions
export function calculatePercentage(count: ProgressCount): number {
  if (count.total === 0) return 0;
  return Math.round((count.completed / count.total) * 100);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function getProgressStatus(
  count: ProgressCount
): "not_started" | "in_progress" | "completed" {
  if (count.completed === 0) return "not_started";
  if (count.completed >= count.total) return "completed";
  return "in_progress";
}

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "text-emerald-500";
  if (percentage >= 75) return "text-blue-500";
  if (percentage >= 50) return "text-amber-500";
  if (percentage > 0) return "text-orange-500";
  return "text-muted-foreground";
}

export function getStatusBadgeVariant(
  status: "not_started" | "in_progress" | "completed"
): "secondary" | "default" | "outline" {
  switch (status) {
    case "completed":
      return "default";
    case "in_progress":
      return "secondary";
    default:
      return "outline";
  }
}
