"use client";

import { useTranslations } from "@/hooks/use-locale";
import { Trophy, Lock, Star, Target, Award, Zap } from "lucide-react";

export default function AchievementsPage() {
  const t = useTranslations();

  // Mock achievements for UI preview
  const mockAchievements = [
    {
      icon: Trophy,
      name: t("dashboard.firstCourse") || "First Course",
      description:
        t("dashboard.firstCourseDesc") || "Complete your first course",
      locked: true,
      progress: 0,
    },
    {
      icon: Star,
      name: t("dashboard.weekStreak") || "Week Streak",
      description: t("dashboard.weekStreakDesc") || "Learn 7 days in a row",
      locked: true,
      progress: 0,
    },
    {
      icon: Target,
      name: t("dashboard.lessonMaster") || "Lesson Master",
      description: t("dashboard.lessonMasterDesc") || "Complete 50 lessons",
      locked: true,
      progress: 0,
    },
    {
      icon: Award,
      name: t("dashboard.quizChampion") || "Quiz Champion",
      description:
        t("dashboard.quizChampionDesc") || "Score 100% on 10 quizzes",
      locked: true,
      progress: 0,
    },
    {
      icon: Zap,
      name: t("dashboard.fastLearner") || "Fast Learner",
      description:
        t("dashboard.fastLearnerDesc") || "Complete 10 lessons in one day",
      locked: true,
      progress: 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("dashboard.achievements") || "Achievements"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("dashboard.achievementsSubtitle") ||
            "Unlock badges and track your milestones"}
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-lg border border-blue-900/50 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <Trophy className="h-8 w-8 text-foreground" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            {t("dashboard.comingSoon") || "Coming Soon"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {t("dashboard.achievementsComingSoonDesc") ||
              "We're building an exciting achievement system to reward your learning progress. Stay tuned!"}
          </p>
        </div>
      </div>

      {/* Achievement Preview (Locked) */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {t("dashboard.upcomingAchievements") || "Upcoming Achievements"}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockAchievements.map((achievement, index) => {
            const Icon = achievement.icon;
            return (
              <div
                key={index}
                className="relative overflow-hidden rounded-lg border border-border bg-card/50 p-6 backdrop-blur"
              >
                {/* Locked Overlay */}
                <div className="absolute top-2 right-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Icon className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Info */}
                <h4 className="font-semibold text-muted-foreground">
                  {achievement.name}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {achievement.description}
                </p>

                {/* Progress Bar (Placeholder) */}
                <div className="mt-4">
                  <div className="h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {achievement.progress}%{" "}
                    {t("dashboard.complete") || "complete"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Preview */}
      <div className="rounded-lg border border-border bg-card/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          {t("dashboard.yourStats") || "Your Stats"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.coursesCompleted") || "Courses Completed"}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.lessonsCompleted") || "Lessons Completed"}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.quizzesPassed") || "Quizzes Passed"}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">0</p>
          </div>
          <div className="rounded-lg bg-card p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.currentStreak") || "Current Streak"}
            </p>
            <p className="mt-1 text-2xl font-bold text-foreground">0 days</p>
          </div>
        </div>
      </div>

      {/* Backend Note */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>{t("dashboard.note") || "Note"}:</strong>{" "}
          {t("dashboard.achievementsNote") ||
            "Achievement system requires backend API for tracking progress, awarding badges, and calculating stats."}
        </p>
      </div>
    </div>
  );
}
