// Achievement Badge System Types
// Gamification and milestone tracking for teachers

export type AchievementType =
  | "top_instructor"
  | "thousand_students"
  | "ten_k_revenue"
  | "high_rating"
  | "first_course"
  | "ten_courses"
  | "hundred_students"
  | "fifty_reviews"
  | "perfect_score"
  | "early_adopter";

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  criteria: string; // Human-readable criteria
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number; // Gamification points
  unlockedAt?: string; // ISO date if unlocked
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  achievement: Achievement;
  unlockedAt: string;
  progress?: number; // 0-100 percentage if partially complete
}

export interface AchievementDefinition {
  type: AchievementType;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  points: number;
  checkFunction: (stats: TeacherStats) => boolean;
  progressFunction?: (stats: TeacherStats) => number; // 0-100
}

export interface TeacherStats {
  userId: string;
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  coursesWithPerfectRating: number;
  joinedAt: string;
}

export interface AchievementProgress {
  achievement: Achievement;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementNotification {
  achievement: Achievement;
  message: string;
  timestamp: string;
}

// Achievement definitions with criteria
export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  Omit<AchievementDefinition, "type" | "checkFunction" | "progressFunction">
> = {
  first_course: {
    name: "First Course",
    description: "Created your first course",
    icon: "🎓",
    criteria: "Create 1 course",
    rarity: "common",
    points: 10,
  },
  ten_courses: {
    name: "Course Creator",
    description: "Created 10 courses",
    icon: "📚",
    criteria: "Create 10 courses",
    rarity: "rare",
    points: 50,
  },
  hundred_students: {
    name: "Popular Teacher",
    description: "Reached 100 students",
    icon: "👥",
    criteria: "Get 100 students enrolled",
    rarity: "rare",
    points: 75,
  },
  thousand_students: {
    name: "Master Educator",
    description: "Reached 1,000 students",
    icon: "🌟",
    criteria: "Get 1,000 students enrolled",
    rarity: "epic",
    points: 200,
  },
  ten_k_revenue: {
    name: "Revenue Master",
    description: "Earned $10,000+",
    icon: "💰",
    criteria: "Earn $10,000 in total revenue",
    rarity: "epic",
    points: 250,
  },
  high_rating: {
    name: "Highly Rated",
    description: "Maintain 4.8+ rating with 50+ reviews",
    icon: "⭐",
    criteria: "4.8+ rating, 50+ reviews",
    rarity: "epic",
    points: 150,
  },
  top_instructor: {
    name: "Top Instructor",
    description: "Maintain 4.5+ rating",
    icon: "🏆",
    criteria: "Maintain 4.5+ rating",
    rarity: "rare",
    points: 100,
  },
  fifty_reviews: {
    name: "Review Magnet",
    description: "Received 50 reviews",
    icon: "💬",
    criteria: "Receive 50 student reviews",
    rarity: "rare",
    points: 60,
  },
  perfect_score: {
    name: "Perfect Score",
    description: "Have a course with 5.0 rating",
    icon: "💯",
    criteria: "1 course with 5.0 rating",
    rarity: "epic",
    points: 120,
  },
  early_adopter: {
    name: "Early Adopter",
    description: "Joined in the first month",
    icon: "🚀",
    criteria: "Join within first month of launch",
    rarity: "legendary",
    points: 500,
  },
};

// Helper functions
export function checkAchievement(
  type: AchievementType,
  stats: TeacherStats
): boolean {
  switch (type) {
    case "first_course":
      return stats.totalCourses >= 1;
    case "ten_courses":
      return stats.totalCourses >= 10;
    case "hundred_students":
      return stats.totalStudents >= 100;
    case "thousand_students":
      return stats.totalStudents >= 1000;
    case "ten_k_revenue":
      return stats.totalRevenue >= 10000;
    case "high_rating":
      return stats.averageRating >= 4.8 && stats.totalReviews >= 50;
    case "top_instructor":
      return stats.averageRating >= 4.5;
    case "fifty_reviews":
      return stats.totalReviews >= 50;
    case "perfect_score":
      return stats.coursesWithPerfectRating >= 1;
    case "early_adopter":
      const launch = new Date("2026-01-01"); // Platform launch date
      const joined = new Date(stats.joinedAt);
      const monthAfterLaunch = new Date(launch);
      monthAfterLaunch.setMonth(monthAfterLaunch.getMonth() + 1);
      return joined >= launch && joined <= monthAfterLaunch;
    default:
      return false;
  }
}

export function calculateAchievementProgress(
  type: AchievementType,
  stats: TeacherStats
): number {
  switch (type) {
    case "ten_courses":
      return Math.min((stats.totalCourses / 10) * 100, 100);
    case "hundred_students":
      return Math.min((stats.totalStudents / 100) * 100, 100);
    case "thousand_students":
      return Math.min((stats.totalStudents / 1000) * 100, 100);
    case "ten_k_revenue":
      return Math.min((stats.totalRevenue / 10000) * 100, 100);
    case "fifty_reviews":
      return Math.min((stats.totalReviews / 50) * 100, 100);
    case "high_rating":
      const ratingProgress = Math.min((stats.averageRating / 4.8) * 50, 50);
      const reviewProgress = Math.min((stats.totalReviews / 50) * 50, 50);
      return ratingProgress + reviewProgress;
    default:
      return checkAchievement(type, stats) ? 100 : 0;
  }
}

export function getRarityColor(
  rarity: "common" | "rare" | "epic" | "legendary"
): string {
  switch (rarity) {
    case "common":
      return "text-gray-500";
    case "rare":
      return "text-blue-500";
    case "epic":
      return "text-purple-500";
    case "legendary":
      return "text-amber-500";
  }
}

export function sortAchievementsByRarity(
  achievements: Achievement[]
): Achievement[] {
  const rarityOrder = { common: 0, rare: 1, epic: 2, legendary: 3 };
  return achievements.sort(
    (a, b) => rarityOrder[b.rarity] - rarityOrder[a.rarity]
  );
}

export function getUnlockedAchievements(
  userAchievements: UserAchievement[]
): Achievement[] {
  return userAchievements
    .filter((ua) => ua.unlockedAt)
    .map((ua) => ua.achievement);
}

export function getTotalAchievementPoints(achievements: Achievement[]): number {
  return achievements.reduce(
    (total, achievement) => total + achievement.points,
    0
  );
}
