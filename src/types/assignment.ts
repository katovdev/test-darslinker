// Assignment System Types
// Supports creating assignments, student submissions, and teacher grading

export interface Assignment {
  id: string;
  lessonId: string;
  title: string;
  instructions: string; // Markdown content
  attachments: AssignmentAttachment[];
  maxScore: number;
  dueDate?: string; // ISO date string
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number; // in bytes
  fileType: string; // mime type
  uploadedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  file: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  };
  submittedAt: string;
  grade?: number; // 0 to maxScore
  feedback?: string; // Teacher's feedback (markdown)
  gradedAt?: string;
  gradedBy?: string; // Teacher ID
  status: "submitted" | "graded" | "resubmit_requested";
}

export interface CreateAssignmentDto {
  lessonId: string;
  title: string;
  instructions: string;
  maxScore: number;
  dueDate?: string;
  attachments?: File[]; // For file upload
}

export interface UpdateAssignmentDto {
  title?: string;
  instructions?: string;
  maxScore?: number;
  dueDate?: string;
}

export interface SubmitAssignmentDto {
  assignmentId: string;
  file: File;
}

export interface GradeSubmissionDto {
  grade: number;
  feedback?: string;
}

// Analytics types for assignments
export interface AssignmentAnalytics {
  assignmentId: string;
  assignmentTitle: string;
  lessonId: string;
  courseId: string;
  courseName: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageGrade: number;
  submissionRate: number; // Percentage of enrolled students who submitted
  submissions: AssignmentSubmission[];
}

export interface TeacherAssignmentOverview {
  totalAssignments: number;
  pendingGrading: number;
  gradedToday: number;
  averageGradeAllTime: number;
  recentSubmissions: AssignmentSubmission[];
}

// Helper functions
export function calculateSubmissionRate(
  submissions: number,
  enrollments: number
): number {
  if (enrollments === 0) return 0;
  return Math.round((submissions / enrollments) * 100);
}

export function getSubmissionStatus(
  submission?: AssignmentSubmission
): "not_submitted" | "submitted" | "graded" | "resubmit_requested" {
  if (!submission) return "not_submitted";
  return submission.status;
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function getDaysUntilDue(dueDate?: string): number | null {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
