import { api } from "./client";
import type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentDto,
  UpdateAssignmentDto,
  GradeSubmissionDto,
  AssignmentAnalytics,
  TeacherAssignmentOverview,
} from "@/types/assignment";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

interface ListResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ListSubmissionsParams {
  page?: number;
  limit?: number;
  assignmentId?: string;
  courseId?: string;
  status?: "submitted" | "graded" | "resubmit_requested";
  search?: string;
}

export const assignmentsApi = {
  // Teacher endpoints - Assignment CRUD
  createAssignment: async (data: CreateAssignmentDto) => {
    const formData = new FormData();
    formData.append("lessonId", data.lessonId);
    formData.append("title", data.title);
    formData.append("instructions", data.instructions);
    formData.append("maxScore", data.maxScore.toString());
    if (data.dueDate) formData.append("dueDate", data.dueDate);

    data.attachments?.forEach((file) => {
      formData.append("attachments", file);
    });

    return api.post<SingleResponse<Assignment>>(
      "/teacher/assignments",
      formData
    );
  },

  getAssignment: (assignmentId: string) =>
    api.get<SingleResponse<Assignment>>(`/teacher/assignments/${assignmentId}`),

  updateAssignment: async (assignmentId: string, data: UpdateAssignmentDto) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.instructions) formData.append("instructions", data.instructions);
    if (data.maxScore !== undefined)
      formData.append("maxScore", data.maxScore.toString());
    if (data.dueDate) formData.append("dueDate", data.dueDate);

    return api.put<SingleResponse<Assignment>>(
      `/teacher/assignments/${assignmentId}`,
      formData
    );
  },

  deleteAssignment: (assignmentId: string) =>
    api.delete<{ success: boolean; message: string }>(
      `/teacher/assignments/${assignmentId}`
    ),

  // Teacher endpoints - View & Grade Submissions
  listSubmissions: (params?: ListSubmissionsParams) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.assignmentId)
      searchParams.set("assignmentId", params.assignmentId);
    if (params?.courseId) searchParams.set("courseId", params.courseId);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return api.get<ListResponse<AssignmentSubmission>>(
      `/teacher/submissions${query ? `?${query}` : ""}`
    );
  },

  getSubmission: (submissionId: string) =>
    api.get<SingleResponse<AssignmentSubmission>>(
      `/teacher/submissions/${submissionId}`
    ),

  gradeSubmission: (submissionId: string, data: GradeSubmissionDto) =>
    api.patch<SingleResponse<AssignmentSubmission>>(
      `/teacher/submissions/${submissionId}/grade`,
      data
    ),

  requestResubmit: (submissionId: string, feedback: string) =>
    api.patch<SingleResponse<AssignmentSubmission>>(
      `/teacher/submissions/${submissionId}/resubmit`,
      { feedback }
    ),

  // Teacher analytics
  getAssignmentAnalytics: (assignmentId: string) =>
    api.get<SingleResponse<AssignmentAnalytics>>(
      `/teacher/assignments/${assignmentId}/analytics`
    ),

  getOverview: () =>
    api.get<SingleResponse<TeacherAssignmentOverview>>(
      "/teacher/assignments/overview"
    ),

  // Student endpoints
  getAssignmentByLesson: (lessonId: string) =>
    api.get<SingleResponse<Assignment>>(`/assignments/lesson/${lessonId}`),

  submitAssignment: async (assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post<SingleResponse<AssignmentSubmission>>(
      `/assignments/${assignmentId}/submit`,
      formData
    );
  },

  getMySubmission: (assignmentId: string) =>
    api.get<SingleResponse<AssignmentSubmission | null>>(
      `/assignments/${assignmentId}/my-submission`
    ),

  updateMySubmission: async (submissionId: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.put<SingleResponse<AssignmentSubmission>>(
      `/assignments/submissions/${submissionId}`,
      formData
    );
  },
};

export default assignmentsApi;
