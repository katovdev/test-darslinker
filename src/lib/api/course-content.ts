import { api } from "./client";
import { courseContentEndpoints } from "./config";

// ====== Module Types ======
export interface Module {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  lessonsCount: number;
}

export interface ModuleDetail extends Module {
  lessons: Lesson[];
}

export interface CreateModuleInput {
  title: string;
  slug?: string;
  description?: string;
  order?: number;
}

export interface UpdateModuleInput {
  title?: string;
  slug?: string;
  description?: string | null;
  order?: number;
}

export interface ReorderModuleItem {
  id: string;
  order: number;
}

// ====== Lesson Types ======
export interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  videoUrl: string | null;
  order: number;
  durationMins: number;
  createdAt: string;
  updatedAt: string;
}

export interface LessonDetail extends Lesson {
  module: {
    id: string;
    title: string;
    courseId: string;
  };
}

export interface CreateLessonInput {
  title: string;
  slug?: string;
  content?: string;
  videoUrl?: string | null;
  order?: number;
  durationMins?: number;
}

export interface UpdateLessonInput {
  title?: string;
  slug?: string;
  content?: string | null;
  videoUrl?: string | null;
  order?: number;
  durationMins?: number;
}

export interface ReorderLessonItem {
  id: string;
  order: number;
}

// ====== Course Content Overview ======
export interface CourseContentOverview {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string | null;
    type: "free" | "paid";
    price: number;
    status: "draft" | "active" | "approved" | "archived";
  };
  modules: Array<
    Module & {
      lessons: Lesson[];
    }
  >;
  stats: {
    modulesCount: number;
    lessonsCount: number;
    totalDuration: number;
  };
}

// ====== Response Types ======
export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ====== API Client ======
export const courseContentApi = {
  // Course Content Overview
  getCourseContent: (courseId: string) =>
    api.get<SingleResponse<CourseContentOverview>>(
      courseContentEndpoints.courseContent(courseId)
    ),

  // ====== Modules ======
  listModules: (
    courseId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { modules: Module[]; pagination: Pagination };
    }>(
      `${courseContentEndpoints.modules(courseId)}${query ? `?${query}` : ""}`
    );
  },

  createModule: (courseId: string, input: CreateModuleInput) =>
    api.post<SingleResponse<Module>>(
      courseContentEndpoints.modules(courseId),
      input
    ),

  getModule: (moduleId: string) =>
    api.get<SingleResponse<ModuleDetail>>(
      courseContentEndpoints.moduleById(moduleId)
    ),

  updateModule: (moduleId: string, input: UpdateModuleInput) =>
    api.put<SingleResponse<Module>>(
      courseContentEndpoints.moduleById(moduleId),
      input
    ),

  deleteModule: (moduleId: string) =>
    api.delete<{ success: boolean; message: string }>(
      courseContentEndpoints.moduleById(moduleId)
    ),

  reorderModules: (courseId: string, modules: ReorderModuleItem[]) =>
    api.put<{ success: boolean; message: string }>(
      courseContentEndpoints.reorderModules(courseId),
      { modules }
    ),

  // ====== Lessons ======
  listLessons: (
    moduleId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    const query = searchParams.toString();
    return api.get<{
      success: boolean;
      data: { lessons: Lesson[]; pagination: Pagination };
    }>(
      `${courseContentEndpoints.lessons(moduleId)}${query ? `?${query}` : ""}`
    );
  },

  createLesson: (moduleId: string, input: CreateLessonInput) =>
    api.post<SingleResponse<Lesson>>(
      courseContentEndpoints.lessons(moduleId),
      input
    ),

  getLesson: (lessonId: string) =>
    api.get<SingleResponse<LessonDetail>>(
      courseContentEndpoints.lessonById(lessonId)
    ),

  updateLesson: (lessonId: string, input: UpdateLessonInput) =>
    api.put<SingleResponse<Lesson>>(
      courseContentEndpoints.lessonById(lessonId),
      input
    ),

  deleteLesson: (lessonId: string) =>
    api.delete<{ success: boolean; message: string }>(
      courseContentEndpoints.lessonById(lessonId)
    ),

  reorderLessons: (moduleId: string, lessons: ReorderLessonItem[]) =>
    api.put<{ success: boolean; message: string }>(
      courseContentEndpoints.reorderLessons(moduleId),
      { lessons }
    ),
};

export default courseContentApi;
