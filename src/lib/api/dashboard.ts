import { adminApi, type AdminStats } from "./admin";
import { teacherApi, type TeacherStats } from "./teacher";
import { moderatorApi } from "./moderator";
import { courseAPI } from "./courses";
import type { User } from "@/context/auth-context";

// Cache duration: 1 minute
const CACHE_DURATION = 60 * 1000;

// Cache storage
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCachedData<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCachedData<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Dashboard stats types
export interface DashboardStats {
  primary: StatItem[];
  secondary?: StatItem[];
}

export interface StatItem {
  label: string;
  value: string | number;
  change?: string; // e.g., "+23%" or "-5%"
  trend?: "up" | "down" | "neutral";
}

/**
 * Fetch dashboard stats based on user role
 * Results are cached for 1 minute
 */
export async function getDashboardStats(user: User): Promise<DashboardStats> {
  const cacheKey = `dashboard-stats-${user.id}-${user.role}`;

  // Check cache first
  const cached = getCachedData<DashboardStats>(cacheKey);
  if (cached) {
    return cached;
  }

  let stats: DashboardStats;

  switch (user.role) {
    case "admin":
      stats = await getAdminStats();
      break;
    case "moderator":
      stats = await getModeratorStats();
      break;
    case "teacher":
      stats = await getTeacherStats();
      break;
    case "student":
      stats = await getStudentStats();
      break;
    default:
      stats = { primary: [] };
  }

  // Cache the result
  setCachedData(cacheKey, stats);

  return stats;
}

async function getAdminStats(): Promise<DashboardStats> {
  const response = await adminApi.getStats();
  const data: AdminStats = response.data;

  return {
    primary: [
      {
        label: "Total Users",
        value: data.users.total.toLocaleString(),
        change: calculateGrowth(data.users.total),
        trend: "up",
      },
      {
        label: "Active Courses",
        value: data.courses.active,
      },
      {
        label: "Revenue",
        value: `$${data.financial.totalRevenue.toLocaleString()}`,
        change: calculateGrowth(data.financial.totalRevenue, 0.23), // 23% example growth
        trend: "up",
      },
      {
        label: "Growth",
        value: "+23%",
        trend: "up",
      },
    ],
  };
}

async function getModeratorStats(): Promise<DashboardStats> {
  const response = await moderatorApi.getStats();
  const data = response.data;

  // Calculate pending items (example - adjust based on actual API)
  const pendingReviews = 12; // This should come from API

  return {
    primary: [
      {
        label: "Pending Reviews",
        value: pendingReviews,
      },
      {
        label: "Active Users",
        value: data.users?.total || 0,
      },
      {
        label: "Total Courses",
        value: data.courses?.total || 0,
      },
      {
        label: "This Week",
        value: "+15",
        trend: "up",
      },
    ],
  };
}

async function getTeacherStats(): Promise<DashboardStats> {
  const response = await teacherApi.getStats();
  const data: TeacherStats = response.data;

  return {
    primary: [
      {
        label: "My Courses",
        value: data.courses.total,
      },
      {
        label: "Students",
        value: data.students.total.toLocaleString(),
      },
      {
        label: "Earnings",
        value: `$${data.earnings.total.toLocaleString()}`,
      },
      {
        label: "Rating",
        value: "4.8", // This should come from reviews API
      },
    ],
  };
}

async function getStudentStats(): Promise<DashboardStats> {
  try {
    const response = await courseAPI.getCourses();
    const enrolledCourses = response.data?.enrolled || [];

    // TODO: Backend should provide progress stats
    // For now, show real enrolled courses count
    return {
      primary: [
        {
          label: "Enrolled Courses",
          value: enrolledCourses.length,
        },
        {
          label: "Completed",
          value: 0, // TODO: Add progress API endpoint
        },
        {
          label: "In Progress",
          value: enrolledCourses.length, // Assume all enrolled are in progress
        },
        {
          label: "Streak",
          value: "0 days", // TODO: Add activity tracking API
          trend: "neutral",
        },
      ],
    };
  } catch (error) {
    console.error("Failed to fetch student stats:", error);
    // Return empty stats on error
    return {
      primary: [
        {
          label: "Enrolled Courses",
          value: 0,
        },
        {
          label: "Completed",
          value: 0,
        },
        {
          label: "In Progress",
          value: 0,
        },
        {
          label: "Streak",
          value: "0 days",
          trend: "neutral",
        },
      ],
    };
  }
}

/**
 * Calculate growth percentage
 * This is a placeholder - real calculation would compare with previous period
 */
function calculateGrowth(current: number, fixedGrowth?: number): string {
  if (fixedGrowth !== undefined) {
    return `+${(fixedGrowth * 100).toFixed(0)}%`;
  }

  // For demo purposes, calculate based on current value
  // In reality, you'd compare with previous period data from API
  const growthRate = Math.min(Math.max((current / 100) * 2, 5), 30);
  return `+${growthRate.toFixed(0)}%`;
}

/**
 * Clear the dashboard stats cache
 * Useful for forcing a refresh
 */
export function clearDashboardCache(): void {
  cache.clear();
}

/**
 * Clear cache for specific user
 */
export function clearUserCache(userId: string): void {
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(userId)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach((key) => cache.delete(key));
}
