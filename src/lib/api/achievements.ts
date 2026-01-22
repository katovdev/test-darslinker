import { api } from "./client";
import type {
  Achievement,
  UserAchievement,
  AchievementProgress,
  TeacherStats,
} from "@/types/achievement";

interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export const achievementsApi = {
  // Get all available achievements
  listAll: () => api.get<SingleResponse<Achievement[]>>("/achievements"),

  // Get user's achievements
  getUserAchievements: (userId?: string) => {
    const path = userId
      ? `/achievements/user/${userId}`
      : "/achievements/my-achievements";
    return api.get<SingleResponse<UserAchievement[]>>(path);
  },

  // Get achievement progress
  getProgress: () =>
    api.get<SingleResponse<AchievementProgress[]>>("/achievements/progress"),

  // Get teacher stats (for achievement calculation)
  getTeacherStats: () =>
    api.get<SingleResponse<TeacherStats>>("/achievements/teacher-stats"),

  // Check and unlock new achievements (run by system/cron)
  checkAchievements: () =>
    api.post<SingleResponse<Achievement[]>>("/achievements/check"),

  // Get single achievement
  getAchievement: (achievementId: string) =>
    api.get<SingleResponse<Achievement>>(`/achievements/${achievementId}`),
};

export default achievementsApi;
