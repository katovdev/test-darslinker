import {
  settingsApi,
  type SiteSettings,
  type TeacherWithSettings,
  type TeacherSettingsDetail,
  type TeacherPageSettings,
  type UpdateSiteSettingsInput,
  type UpdateTeacherPageSettingsInput,
  type ListTeachersParams,
  type Pagination,
} from "@/lib/api/settings";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache: Map<string, CacheEntry<unknown>> = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const cacheKey = "site-settings";
  const cached = getCached<SiteSettings>(cacheKey);
  if (cached) return cached;

  try {
    const response = await settingsApi.getSiteSettings();
    if (response.success) {
      setCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch site settings:", error);
    return null;
  }
}

export async function updateSiteSettings(
  input: UpdateSiteSettingsInput
): Promise<SiteSettings | null> {
  try {
    const response = await settingsApi.updateSiteSettings(input);
    if (response.success) {
      invalidateCache("site-settings");
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to update site settings:", error);
    throw error;
  }
}

export async function listTeachers(
  params?: ListTeachersParams
): Promise<{ teachers: TeacherWithSettings[]; pagination: Pagination } | null> {
  const cacheKey = `teachers:${JSON.stringify(params || {})}`;
  const cached = getCached<{
    teachers: TeacherWithSettings[];
    pagination: Pagination;
  }>(cacheKey);
  if (cached) return cached;

  try {
    const response = await settingsApi.listTeachers(params);
    if (response.success) {
      setCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch teachers:", error);
    return null;
  }
}

export async function getTeacherSettings(
  teacherId: string
): Promise<TeacherSettingsDetail | null> {
  const cacheKey = `teacher-settings:${teacherId}`;
  const cached = getCached<TeacherSettingsDetail>(cacheKey);
  if (cached) return cached;

  try {
    const response = await settingsApi.getTeacherSettings(teacherId);
    if (response.success) {
      setCache(cacheKey, response.data);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch teacher settings:", error);
    return null;
  }
}

export async function updateTeacherSettings(
  teacherId: string,
  input: UpdateTeacherPageSettingsInput
): Promise<TeacherPageSettings | null> {
  try {
    const response = await settingsApi.updateTeacherSettings(teacherId, input);
    if (response.success) {
      invalidateCache(`teacher-settings:${teacherId}`);
      invalidateCache("teachers:");
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Failed to update teacher settings:", error);
    throw error;
  }
}

export async function deleteTeacherSettings(
  teacherId: string
): Promise<boolean> {
  try {
    const response = await settingsApi.deleteTeacherSettings(teacherId);
    if (response.success) {
      invalidateCache(`teacher-settings:${teacherId}`);
      invalidateCache("teachers:");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete teacher settings:", error);
    throw error;
  }
}

export const settingsService = {
  getSiteSettings,
  updateSiteSettings,
  listTeachers,
  getTeacherSettings,
  updateTeacherSettings,
  deleteTeacherSettings,
};

export default settingsService;
