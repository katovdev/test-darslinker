"use client";

import * as React from "react";
import type {
  CourseProgress,
  CourseProgressDetail,
  ModuleProgress,
  LessonProgress,
  StudentOverview,
  CourseAnalytics,
  ProgressFilters,
  PaginatedResponse,
  AnalyticsSummary,
  ProgressEvent,
  ProgressEventType,
  EngagementMetrics,
  ProgressTimeSeries,
} from "@/types/progress";

// API base URL - should be configured via environment
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    credentials: "include",
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const json: ApiResponse<T> = await response.json();

  if (!json.success) {
    throw new Error(json.error?.message || "API request failed");
  }

  return json.data;
}

// ============================================
// Student Progress Hooks (for learners)
// ============================================

export function useCourseProgress(courseId: string, userId?: string) {
  const [progress, setProgress] = React.useState<CourseProgress | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProgress = React.useCallback(async () => {
    if (!courseId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = userId ? `?userId=${userId}` : "";
      const data = await fetchApi<CourseProgress>(
        `/progress/courses/${courseId}${params}`
      );
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  React.useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
}

export function useCourseProgressDetail(courseId: string, userId?: string) {
  const [progress, setProgress] = React.useState<CourseProgressDetail | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProgress = React.useCallback(async () => {
    if (!courseId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const params = userId ? `?userId=${userId}` : "";
      const data = await fetchApi<CourseProgressDetail>(
        `/progress/courses/${courseId}/detail${params}`
      );
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, [courseId, userId]);

  React.useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, error, refetch: fetchProgress };
}

export function useModuleProgress(moduleId: string, userId?: string) {
  const [progress, setProgress] = React.useState<ModuleProgress | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!moduleId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const params = userId ? `?userId=${userId}` : "";
        const data = await fetchApi<ModuleProgress>(
          `/progress/modules/${moduleId}${params}`
        );
        setProgress(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [moduleId, userId]);

  return { progress, loading, error };
}

export function useLessonProgress(lessonId: string, userId?: string) {
  const [progress, setProgress] = React.useState<LessonProgress | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!lessonId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const params = userId ? `?userId=${userId}` : "";
        const data = await fetchApi<LessonProgress>(
          `/progress/lessons/${lessonId}${params}`
        );
        setProgress(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [lessonId, userId]);

  return { progress, loading, error };
}

export function useMyProgress() {
  const [courses, setCourses] = React.useState<CourseProgress[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchProgress = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<CourseProgress[]>("/progress/me");
      setCourses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { courses, loading, error, refetch: fetchProgress };
}

// ============================================
// Progress Update Hooks (for tracking events)
// ============================================

export function useProgressTracker(lessonId: string) {
  const [isTracking, setIsTracking] = React.useState(false);

  const trackEvent = React.useCallback(
    async (
      type: ProgressEventType,
      metadata?: Record<string, unknown>
    ): Promise<void> => {
      try {
        setIsTracking(true);
        await fetchApi<void>("/progress/events", {
          method: "POST",
          body: JSON.stringify({
            type,
            lessonId,
            metadata,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (err) {
        console.error("Failed to track progress event:", err);
      } finally {
        setIsTracking(false);
      }
    },
    [lessonId]
  );

  const startLesson = React.useCallback(
    () => trackEvent("lesson_started"),
    [trackEvent]
  );

  const completeLesson = React.useCallback(
    () => trackEvent("lesson_completed"),
    [trackEvent]
  );

  const updateVideoProgress = React.useCallback(
    (currentTime: number, duration: number) =>
      trackEvent("video_progress", {
        currentTime,
        duration,
        percentage: Math.round((currentTime / duration) * 100),
      }),
    [trackEvent]
  );

  const recordQuizAttempt = React.useCallback(
    (score: number, passed: boolean) =>
      trackEvent(passed ? "quiz_passed" : "quiz_attempt", { score, passed }),
    [trackEvent]
  );

  return {
    isTracking,
    trackEvent,
    startLesson,
    completeLesson,
    updateVideoProgress,
    recordQuizAttempt,
  };
}

// Debounced video progress tracker
export function useVideoProgressTracker(
  lessonId: string,
  debounceMs: number = 5000
) {
  const lastUpdateRef = React.useRef<number>(0);
  const { updateVideoProgress, isTracking } = useProgressTracker(lessonId);

  const trackProgress = React.useCallback(
    (currentTime: number, duration: number) => {
      const now = Date.now();
      if (now - lastUpdateRef.current >= debounceMs) {
        lastUpdateRef.current = now;
        updateVideoProgress(currentTime, duration);
      }
    },
    [updateVideoProgress, debounceMs]
  );

  // Force update on unmount or when video ends
  const flushProgress = React.useCallback(
    (currentTime: number, duration: number) => {
      lastUpdateRef.current = 0;
      updateVideoProgress(currentTime, duration);
    },
    [updateVideoProgress]
  );

  return { trackProgress, flushProgress, isTracking };
}

// ============================================
// Teacher Analytics Hooks
// ============================================

export function useAnalyticsSummary() {
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchSummary = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<AnalyticsSummary>("/analytics/summary");
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

export function useCourseAnalytics(courseId: string) {
  const [analytics, setAnalytics] = React.useState<CourseAnalytics | null>(
    null
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    if (!courseId) {
      setAnalytics(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchApi<CourseAnalytics>(
        `/analytics/courses/${courseId}`
      );
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
}

export function useStudentList(filters: ProgressFilters = {}) {
  const [students, setStudents] =
    React.useState<PaginatedResponse<StudentOverview> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchStudents = React.useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.courseId) params.set("courseId", filters.courseId);
      if (filters.status) params.set("status", filters.status.join(","));
      if (filters.dateRange?.start)
        params.set("startDate", filters.dateRange.start);
      if (filters.dateRange?.end) params.set("endDate", filters.dateRange.end);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);
      if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));

      const data = await fetchApi<PaginatedResponse<StudentOverview>>(
        `/analytics/students?${params.toString()}`
      );
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, refetch: fetchStudents };
}

export function useStudentProgress(userId: string) {
  const [overview, setOverview] = React.useState<StudentOverview | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!userId) {
      setOverview(null);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setLoading(true);
        const data = await fetchApi<StudentOverview>(
          `/analytics/students/${userId}`
        );
        setOverview(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  return { overview, loading, error };
}

export function useEngagementMetrics(
  courseId?: string,
  period: "day" | "week" | "month" = "week"
) {
  const [metrics, setMetrics] = React.useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ period });
        if (courseId) params.set("courseId", courseId);
        const data = await fetchApi<EngagementMetrics>(
          `/analytics/engagement?${params.toString()}`
        );
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, period]);

  return { metrics, loading, error };
}

export function useProgressTimeSeries(courseId?: string, days: number = 30) {
  const [timeSeries, setTimeSeries] = React.useState<ProgressTimeSeries[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ days: String(days) });
        if (courseId) params.set("courseId", courseId);
        const data = await fetchApi<ProgressTimeSeries[]>(
          `/analytics/time-series?${params.toString()}`
        );
        setTimeSeries(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, days]);

  return { timeSeries, loading, error };
}

export function useRecentActivity(limit: number = 20) {
  const [events, setEvents] = React.useState<ProgressEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchEvents = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchApi<ProgressEvent[]>(
        `/analytics/activity?limit=${limit}`
      );
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch"));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
}

// ============================================
// Progress Context (optional global state)
// ============================================

interface ProgressContextValue {
  currentCourseProgress: CourseProgress | null;
  setCurrentCourseProgress: (progress: CourseProgress | null) => void;
  refreshProgress: () => void;
}

const ProgressContext = React.createContext<ProgressContextValue | null>(null);

export function ProgressProvider({
  children,
  courseId,
}: {
  children: React.ReactNode;
  courseId?: string;
}) {
  const [currentCourseProgress, setCurrentCourseProgress] =
    React.useState<CourseProgress | null>(null);

  const { progress, refetch } = useCourseProgress(courseId || "");

  React.useEffect(() => {
    if (progress) {
      setCurrentCourseProgress(progress);
    }
  }, [progress]);

  const value = React.useMemo(
    () => ({
      currentCourseProgress,
      setCurrentCourseProgress,
      refreshProgress: refetch,
    }),
    [currentCourseProgress, refetch]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const context = React.useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgressContext must be used within ProgressProvider");
  }
  return context;
}
