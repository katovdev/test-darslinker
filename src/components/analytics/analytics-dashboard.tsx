"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard, StatsGrid } from "./stats-card";
import { ProgressChart, ProgressDonut, ProgressBarList } from "./progress-chart";
import { StudentTable } from "./student-table";
import { ActivityFeed } from "./activity-feed";
import {
  Users,
  BookOpen,
  Trophy,
  Clock,
  TrendingUp,
  GraduationCap,
  Target,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAnalyticsSummary,
  useCourseAnalytics,
  useStudentList,
  useProgressTimeSeries,
  useRecentActivity,
} from "@/hooks/use-progress";
import { formatDuration } from "@/types/progress";
import type { ProgressFilters } from "@/types/progress";

interface AnalyticsDashboardProps {
  courses?: { id: string; title: string }[];
  onStudentClick?: (userId: string) => void;
  className?: string;
}

export function AnalyticsDashboard({
  courses = [],
  onStudentClick,
  className,
}: AnalyticsDashboardProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>("all");
  const [studentFilters, setStudentFilters] = React.useState<ProgressFilters>({
    page: 1,
    limit: 10,
    sortBy: "lastActive",
    sortOrder: "desc",
  });

  // Fetch data
  const { summary, loading: summaryLoading, refetch: refetchSummary } = useAnalyticsSummary();
  const { analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useCourseAnalytics(
    selectedCourse !== "all" ? selectedCourse : ""
  );
  const { students, loading: studentsLoading, refetch: refetchStudents } = useStudentList({
    ...studentFilters,
    courseId: selectedCourse !== "all" ? selectedCourse : undefined,
  });
  const { timeSeries } = useProgressTimeSeries(
    selectedCourse !== "all" ? selectedCourse : undefined
  );
  const { events, refetch: refetchEvents } = useRecentActivity(20);

  const handleRefresh = () => {
    refetchSummary();
    refetchAnalytics();
    refetchStudents();
    refetchEvents();
  };

  const isLoading = summaryLoading || analyticsLoading || studentsLoading;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track student progress and engagement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Total Students"
          value={summary?.totalStudents ?? "-"}
          description={`${summary?.activeStudents ?? 0} active this week`}
          icon={<Users className="h-4 w-4" />}
          trend={
            summary
              ? {
                  value: 12,
                  label: "from last month",
                }
              : undefined
          }
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round(summary?.averageCompletionRate ?? 0)}%`}
          description="Average across all courses"
          icon={<Trophy className="h-4 w-4" />}
          trend={
            summary
              ? {
                  value: 5,
                  label: "from last month",
                }
              : undefined
          }
        />
        <StatsCard
          title="Total Courses"
          value={summary?.totalCourses ?? "-"}
          description="Published courses"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Time Spent"
          value={formatDuration(summary?.totalTimeSpent ?? 0)}
          description="Across all students"
          icon={<Clock className="h-4 w-4" />}
        />
      </StatsGrid>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Progress Chart */}
            <div className="lg:col-span-2">
              <ProgressChart
                data={timeSeries}
                title="Enrollment & Completion Trends"
              />
            </div>

            {/* Progress Distribution */}
            <ProgressDonut
              completed={analytics?.progressDistribution.completed ?? 0}
              inProgress={analytics?.progressDistribution.inProgress ?? 0}
              notStarted={analytics?.progressDistribution.notStarted ?? 0}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Module Progress */}
            <div className="lg:col-span-2">
              {analytics?.moduleAnalytics && (
                <ProgressBarList
                  items={analytics.moduleAnalytics.map((m) => ({
                    label: m.moduleTitle,
                    value: Math.round(m.completionRate),
                    total: 100,
                    color:
                      m.completionRate >= 70
                        ? "bg-emerald-500"
                        : m.completionRate >= 40
                          ? "bg-amber-500"
                          : "bg-red-500",
                  }))}
                  title="Module Completion Rates"
                />
              )}
            </div>

            {/* Activity Feed */}
            <ActivityFeed events={events} maxHeight={300} />
          </div>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <StudentTable
            students={students?.data ?? []}
            pagination={students?.pagination}
            filters={studentFilters}
            onFiltersChange={setStudentFilters}
            onStudentClick={onStudentClick}
            loading={studentsLoading}
          />
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {selectedCourse === "all" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  courseId={course.id}
                  title={course.title}
                  onSelect={() => setSelectedCourse(course.id)}
                />
              ))}
            </div>
          ) : (
            analytics && (
              <CourseAnalyticsDetail
                analytics={analytics}
                onBack={() => setSelectedCourse("all")}
              />
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Course card component
interface CourseCardProps {
  courseId: string;
  title: string;
  onSelect: () => void;
}

function CourseCard({ courseId, title, onSelect }: CourseCardProps) {
  const { analytics } = useCourseAnalytics(courseId);

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/50"
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Students</div>
            <div className="font-medium">
              {analytics?.totalEnrollments ?? "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Completion</div>
            <div className="font-medium">
              {analytics ? `${Math.round(analytics.completionRate)}%` : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Avg. Score</div>
            <div className="font-medium">
              {analytics ? `${Math.round(analytics.averageQuizScore)}%` : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Active</div>
            <div className="font-medium">{analytics?.activeStudents ?? "-"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Course analytics detail view
interface CourseAnalyticsDetailProps {
  analytics: NonNullable<ReturnType<typeof useCourseAnalytics>["analytics"]>;
  onBack: () => void;
}

function CourseAnalyticsDetail({
  analytics,
  onBack,
}: CourseAnalyticsDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back to Courses
        </Button>
        <h2 className="text-xl font-bold">{analytics.courseTitle}</h2>
      </div>

      {/* Course stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Enrollments"
          value={analytics.totalEnrollments}
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round(analytics.completionRate)}%`}
          icon={<Target className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg. Quiz Score"
          value={`${Math.round(analytics.averageQuizScore)}%`}
          icon={<GraduationCap className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg. Progress"
          value={`${Math.round(analytics.averageProgress)}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </StatsGrid>

      {/* Module breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analytics.moduleAnalytics.map((module) => (
              <div key={module.moduleId} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{module.moduleTitle}</h3>
                    <p className="text-muted-foreground text-xs">
                      {module.lessonAnalytics.length} lessons •{" "}
                      {Math.round(module.completionRate)}% completion rate
                    </p>
                  </div>
                  {module.dropOffRate > 20 && (
                    <span className="text-xs text-amber-500">
                      {Math.round(module.dropOffRate)}% drop-off
                    </span>
                  )}
                </div>

                {/* Lessons */}
                <div className="space-y-2 pl-4">
                  {module.lessonAnalytics.map((lesson) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {lesson.lessonTitle}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground text-xs">
                          {formatDuration(lesson.averageTimeSpent)}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            lesson.completionRate >= 70
                              ? "text-emerald-500"
                              : lesson.completionRate >= 40
                                ? "text-amber-500"
                                : "text-red-500"
                          )}
                        >
                          {Math.round(lesson.completionRate)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
