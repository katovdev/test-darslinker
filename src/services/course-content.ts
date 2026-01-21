import {
  courseContentApi,
  type Module,
  type ModuleDetail,
  type CreateModuleInput,
  type UpdateModuleInput,
  type ReorderModuleItem,
  type Lesson,
  type LessonDetail,
  type CreateLessonInput,
  type UpdateLessonInput,
  type ReorderLessonItem,
  type CourseContentOverview,
  type Pagination,
} from "@/lib/api/course-content";
import {
  teacherApi,
  type TeacherCourse,
  type TeacherCourseDetail,
  type CreateCourseInput,
  type UpdateCourseInput,
} from "@/lib/api/teacher";
import { cacheConfig } from "@/lib/api/config";
import { logger } from "@/lib/logger";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class CourseContentService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cacheTimeout = cacheConfig.defaultTTL;

  private getCacheKey(method: string, params: unknown = {}): string {
    return `course_content_${method}_${JSON.stringify(params)}`;
  }

  private isCacheValid<T>(cacheEntry: CacheEntry<T> | undefined): boolean {
    return (
      !!cacheEntry && Date.now() - cacheEntry.timestamp < this.cacheTimeout
    );
  }

  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey) as CacheEntry<T> | undefined;

    if (this.isCacheValid(cached)) {
      return cached!.data;
    }

    try {
      const data = await fetchFn();
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      logger.error("Course content API request failed:", error);

      if (cached) {
        logger.warn("Course content API failed, using stale cache");
        return cached.data;
      }

      throw error;
    }
  }

  // ====== Course Operations ======
  async getCourse(courseId: string): Promise<TeacherCourseDetail | null> {
    const cacheKey = this.getCacheKey("course", { courseId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        teacherApi.getCourse(courseId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch course:", error);
      return null;
    }
  }

  async createCourse(input: CreateCourseInput): Promise<TeacherCourse | null> {
    try {
      const response = await teacherApi.createCourse(input);

      if (response?.success && response.data) {
        this.clearCachePattern("courses");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to create course:", error);
      throw error;
    }
  }

  async updateCourse(
    courseId: string,
    input: UpdateCourseInput
  ): Promise<TeacherCourse | null> {
    try {
      const response = await teacherApi.updateCourse(courseId, input);

      if (response?.success && response.data) {
        this.clearCachePattern("course");
        this.clearCachePattern("courses");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update course:", error);
      throw error;
    }
  }

  async deleteCourse(courseId: string): Promise<boolean> {
    try {
      const response = await teacherApi.deleteCourse(courseId);

      if (response?.success) {
        this.clearCachePattern("course");
        this.clearCachePattern("courses");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete course:", error);
      throw error;
    }
  }

  // ====== Course Content Overview ======
  async getCourseContent(
    courseId: string
  ): Promise<CourseContentOverview | null> {
    const cacheKey = this.getCacheKey("content", { courseId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        courseContentApi.getCourseContent(courseId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch course content:", error);
      return null;
    }
  }

  // ====== Module Operations ======
  async listModules(
    courseId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ modules: Module[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("modules", { courseId, ...params });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        courseContentApi.listModules(courseId, params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch modules:", error);
      return null;
    }
  }

  async getModule(moduleId: string): Promise<ModuleDetail | null> {
    const cacheKey = this.getCacheKey("module", { moduleId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        courseContentApi.getModule(moduleId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch module:", error);
      return null;
    }
  }

  async createModule(
    courseId: string,
    input: CreateModuleInput
  ): Promise<Module | null> {
    try {
      const response = await courseContentApi.createModule(courseId, input);

      if (response?.success && response.data) {
        this.clearCachePattern("modules");
        this.clearCachePattern("content");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to create module:", error);
      throw error;
    }
  }

  async updateModule(
    moduleId: string,
    input: UpdateModuleInput
  ): Promise<Module | null> {
    try {
      const response = await courseContentApi.updateModule(moduleId, input);

      if (response?.success && response.data) {
        this.clearCachePattern("module");
        this.clearCachePattern("modules");
        this.clearCachePattern("content");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update module:", error);
      throw error;
    }
  }

  async deleteModule(moduleId: string): Promise<boolean> {
    try {
      const response = await courseContentApi.deleteModule(moduleId);

      if (response?.success) {
        this.clearCachePattern("module");
        this.clearCachePattern("modules");
        this.clearCachePattern("content");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete module:", error);
      throw error;
    }
  }

  async reorderModules(
    courseId: string,
    modules: ReorderModuleItem[]
  ): Promise<boolean> {
    try {
      const response = await courseContentApi.reorderModules(courseId, modules);

      if (response?.success) {
        this.clearCachePattern("modules");
        this.clearCachePattern("content");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to reorder modules:", error);
      throw error;
    }
  }

  // ====== Lesson Operations ======
  async listLessons(
    moduleId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{ lessons: Lesson[]; pagination: Pagination } | null> {
    const cacheKey = this.getCacheKey("lessons", { moduleId, ...params });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        courseContentApi.listLessons(moduleId, params)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch lessons:", error);
      return null;
    }
  }

  async getLesson(lessonId: string): Promise<LessonDetail | null> {
    const cacheKey = this.getCacheKey("lesson", { lessonId });

    try {
      const response = await this.getCachedOrFetch(cacheKey, () =>
        courseContentApi.getLesson(lessonId)
      );

      if (response?.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to fetch lesson:", error);
      return null;
    }
  }

  async createLesson(
    moduleId: string,
    input: CreateLessonInput
  ): Promise<Lesson | null> {
    try {
      const response = await courseContentApi.createLesson(moduleId, input);

      if (response?.success && response.data) {
        this.clearCachePattern("lessons");
        this.clearCachePattern("module");
        this.clearCachePattern("content");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to create lesson:", error);
      throw error;
    }
  }

  async updateLesson(
    lessonId: string,
    input: UpdateLessonInput
  ): Promise<Lesson | null> {
    try {
      const response = await courseContentApi.updateLesson(lessonId, input);

      if (response?.success && response.data) {
        this.clearCachePattern("lesson");
        this.clearCachePattern("lessons");
        this.clearCachePattern("content");
        return response.data;
      }
      return null;
    } catch (error) {
      logger.error("Failed to update lesson:", error);
      throw error;
    }
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    try {
      const response = await courseContentApi.deleteLesson(lessonId);

      if (response?.success) {
        this.clearCachePattern("lesson");
        this.clearCachePattern("lessons");
        this.clearCachePattern("module");
        this.clearCachePattern("content");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to delete lesson:", error);
      throw error;
    }
  }

  async reorderLessons(
    moduleId: string,
    lessons: ReorderLessonItem[]
  ): Promise<boolean> {
    try {
      const response = await courseContentApi.reorderLessons(moduleId, lessons);

      if (response?.success) {
        this.clearCachePattern("lessons");
        this.clearCachePattern("module");
        this.clearCachePattern("content");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to reorder lessons:", error);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCachePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export const courseContentService = new CourseContentService();
export default courseContentService;
