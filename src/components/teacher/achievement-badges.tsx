"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock } from "lucide-react";
import type { Achievement } from "@/types/achievement";
import { getRarityColor, getRarityLabel } from "@/lib/achievements";

interface AchievementBadgesProps {
  achievements: Achievement[];
  showLocked?: boolean;
  compact?: boolean;
}

export function AchievementBadges({
  achievements,
  showLocked = false,
  compact = false,
}: AchievementBadgesProps) {
  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  if (!compact && achievements.length === 0) {
    return null;
  }

  if (compact) {
    // Compact view for teacher landing page
    return (
      <div className="flex flex-wrap gap-2">
        {unlockedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${getRarityColor(
              achievement.rarity
            )}`}
            title={achievement.description}
          >
            <span className="text-xl">{achievement.icon}</span>
            <span className="text-sm font-medium">{achievement.name}</span>
          </div>
        ))}
      </div>
    );
  }

  // Full view for achievements page
  return (
    <div className="space-y-6">
      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-white">
              Yutuqlar ({unlockedAchievements.length})
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`border p-4 ${getRarityColor(achievement.rarity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900/50 text-2xl">
                    {achievement.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {getRarityLabel(achievement.rarity)}
                      </Badge>
                    </div>

                    <p className="text-sm opacity-80">
                      {achievement.description}
                    </p>

                    {achievement.unlockedAt && (
                      <p className="mt-2 text-xs opacity-60">
                        Ochildi:{" "}
                        {new Date(achievement.unlockedAt).toLocaleDateString(
                          "uz-UZ",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {showLocked && lockedAchievements.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-white">
              Qulflangan yutuqlar ({lockedAchievements.length})
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lockedAchievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="border-gray-700 bg-gray-800 p-4 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900/50 text-2xl">
                    {achievement.icon}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gray-900/70">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h4 className="font-semibold text-white">
                        {achievement.name}
                      </h4>
                      <Badge
                        variant="secondary"
                        className="bg-gray-700 text-xs text-gray-400 capitalize"
                      >
                        {getRarityLabel(achievement.rarity)}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-400">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!showLocked && unlockedAchievements.length === 0 && (
        <Card className="border-gray-700 bg-gray-800 p-12 text-center">
          <Sparkles className="mx-auto h-16 w-16 text-gray-600" />
          <h3 className="mt-4 text-lg font-semibold text-white">
            Hali yutuqlar yo&apos;q
          </h3>
          <p className="mt-2 text-gray-400">
            Kurslar yarating va talabalarni o&apos;rgating, yutuqlarga erishing!
          </p>
        </Card>
      )}
    </div>
  );
}
