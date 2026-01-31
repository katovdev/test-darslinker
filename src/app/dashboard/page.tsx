"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useTranslations } from "@/hooks/use-locale";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  getDashboardStats,
  type DashboardStats,
  type StatItem,
} from "@/lib/api/dashboard";

// Map stat labels to icons
function getStatIcon(label: string) {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("user") || lowerLabel.includes("student"))
    return Users;
  if (lowerLabel.includes("course")) return BookOpen;
  if (lowerLabel.includes("revenue") || lowerLabel.includes("earning"))
    return DollarSign;
  if (
    lowerLabel.includes("growth") ||
    lowerLabel.includes("trend") ||
    lowerLabel.includes("streak")
  )
    return TrendingUp;
  if (lowerLabel.includes("rating") || lowerLabel.includes("completed"))
    return Award;
  if (
    lowerLabel.includes("pending") ||
    lowerLabel.includes("progress") ||
    lowerLabel.includes("review")
  )
    return Clock;
  return TrendingUp; // default
}

export default function DashboardPage() {
  const { user } = useAuth();
  const t = useTranslations();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      if (!user) return; // TypeScript guard

      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats(user);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  const handleRefresh = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats(user);
      setStats(data);
    } catch (err) {
      console.error("Failed to refresh dashboard stats:", err);
      setError("Failed to refresh statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Get welcome message based on role
  const getWelcomeMessage = () => {
    switch (user.role) {
      case "admin":
        return {
          title: t("dashboard.welcomeAdmin", { name: user.firstName }),
          subtitle: t("dashboard.adminSubtitle"),
        };
      case "moderator":
        return {
          title: t("dashboard.welcomeModerator", { name: user.firstName }),
          subtitle: t("dashboard.moderatorSubtitle"),
        };
      case "teacher":
        return {
          title: t("dashboard.welcomeTeacher", { name: user.firstName }),
          subtitle: t("dashboard.teacherSubtitle"),
        };
      case "student":
      default:
        return {
          title: t("dashboard.welcomeStudent", { name: user.firstName }),
          subtitle: t("dashboard.studentSubtitle"),
        };
    }
  };

  const welcome = getWelcomeMessage();

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{welcome.title}</h1>
          <p className="mt-2 text-muted-foreground">{welcome.subtitle}</p>
        </div>

        {/* Refresh Button */}
        {!loading && (
          <button
            onClick={handleRefresh}
            className="rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
            title="Refresh statistics"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && !stats && (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-muted-foreground">Loading statistics...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-400">
                Error Loading Statistics
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-900/20 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-900/30"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {stats && !loading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.primary.map((stat: StatItem) => {
            const Icon = getStatIcon(stat.label);
            return (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-card p-6 backdrop-blur transition-colors hover:border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p
                        className={`mt-1 text-xs font-medium ${
                          stat.trend === "up"
                            ? "text-green-400"
                            : stat.trend === "down"
                              ? "text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className="rounded-lg bg-secondary p-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      {!loading && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {t("dashboard.quickActions") || "Quick Actions"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user.role === "student" && (
              <>
                <QuickActionCard
                  title={t("dashboard.continueLearning") || "Continue Learning"}
                  description="Pick up where you left off"
                  href="/dashboard/courses"
                />
                <QuickActionCard
                  title={t("dashboard.exploreBlogs") || "Explore Blogs"}
                  description="Read latest articles"
                  href="/blog"
                />
                <QuickActionCard
                  title={t("dashboard.viewProgress") || "View Progress"}
                  description="Check your achievements"
                  href="/dashboard/progress"
                />
              </>
            )}

            {user.role === "teacher" && (
              <>
                <QuickActionCard
                  title={t("dashboard.createCourse") || "Create Course"}
                  description="Start a new course"
                  href="/dashboard/courses"
                />
                <QuickActionCard
                  title={t("dashboard.viewStudents") || "View Students"}
                  description="Manage your students"
                  href="/dashboard/students"
                />
                <QuickActionCard
                  title={t("dashboard.checkEarnings") || "Check Earnings"}
                  description="View your earnings"
                  href="/dashboard/earnings"
                />
              </>
            )}

            {(user.role === "admin" || user.role === "moderator") && (
              <>
                <QuickActionCard
                  title={t("dashboard.manageUsers") || "Manage Users"}
                  description="View and manage users"
                  href="/dashboard/users"
                />
                <QuickActionCard
                  title={t("dashboard.reviewCourses") || "Review Courses"}
                  description="Moderate course content"
                  href="/dashboard/courses"
                />
                <QuickActionCard
                  title={t("dashboard.viewReports") || "View Reports"}
                  description="Check platform stats"
                  href="/dashboard"
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* Cache Info (only in development) */}
      {process.env.NODE_ENV === "development" && stats && (
        <div className="mt-8 rounded-lg border border-border bg-card/50 p-4">
          <p className="text-xs text-muted-foreground">
            Statistics are cached for 1 minute for better performance. Click the
            refresh button to fetch latest data.
          </p>
        </div>
      )}
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-border bg-card p-6 backdrop-blur transition-colors hover:border-border hover:bg-secondary"
    >
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </a>
  );
}
