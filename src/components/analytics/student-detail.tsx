"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard, StatsGrid } from "./stats-card";
import { ActivityTimeline } from "./activity-feed";
import {
  ArrowLeft,
  User,
  BookOpen,
  Trophy,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  PlayCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useStudentProgress,
  useCourseProgressDetail,
} from "@/hooks/use-progress";
import {
  formatDuration,
  calculatePercentage,
  getProgressStatus,
} from "@/types/progress";

interface StudentDetailProps {
  userId: string;
  onBack?: () => void;
  className?: string;
}

export function StudentDetail({
  userId,
  onBack,
  className,
}: StudentDetailProps) {
  const { overview, loading, error } = useStudentProgress(userId);
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(
    null
  );

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="bg-muted h-32 animate-pulse rounded-lg" />
        <div className="bg-muted h-64 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Failed to load student details
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-start gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="relative h-16 w-16 overflow-hidden">
          {overview.userAvatar ? (
            <Image
              src={overview.userAvatar}
              alt={overview.userName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="bg-muted flex h-full w-full items-center justify-center">
              <User className="text-muted-foreground h-8 w-8" />
            </div>
          )}
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{overview.userName}</h1>
          <p className="text-muted-foreground">{overview.userEmail}</p>
          <div className="text-muted-foreground mt-1 flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Last active:{" "}
              {new Date(overview.lastActiveAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsGrid columns={4}>
        <StatsCard
          title="Enrolled Courses"
          value={overview.enrolledCourses}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard
          title="Completed Courses"
          value={overview.completedCourses}
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatsCard
          title="Avg. Quiz Score"
          value={`${Math.round(overview.averageQuizScore)}%`}
          icon={<Trophy className="h-4 w-4" />}
        />
        <StatsCard
          title="Total Time"
          value={formatDuration(overview.totalTimeSpentSeconds)}
          icon={<Clock className="h-4 w-4" />}
        />
      </StatsGrid>

      {/* Course Progress */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Clock className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          {selectedCourse ? (
            <CourseDetailView
              courseId={selectedCourse}
              userId={userId}
              onBack={() => setSelectedCourse(null)}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overview.coursesProgress.map((course) => {
                const progress = calculatePercentage(course.lessons);
                const status = getProgressStatus(course.lessons);

                return (
                  <Card
                    key={course.courseId}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedCourse(course.courseId)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          {course.courseTitle}
                        </CardTitle>
                        <Badge
                          variant={
                            status === "completed"
                              ? "success"
                              : status === "in_progress"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="flex-1" />
                          <span className="text-sm font-medium">
                            {progress}%
                          </span>
                        </div>
                        <div className="text-muted-foreground flex items-center justify-between text-xs">
                          <span>
                            {course.lessons.completed}/{course.lessons.total}{" "}
                            lessons
                          </span>
                          <span>
                            {course.modules.completed}/{course.modules.total}{" "}
                            modules
                          </span>
                        </div>
                        {course.completedAt && (
                          <div className="text-xs text-emerald-500">
                            Completed on{" "}
                            {new Date(course.completedAt).toLocaleDateString()}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-between"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline events={[]} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface CourseDetailViewProps {
  courseId: string;
  userId: string;
  onBack: () => void;
}

function CourseDetailView({ courseId, userId, onBack }: CourseDetailViewProps) {
  const { progress, loading } = useCourseProgressDetail(courseId, userId);

  if (loading) {
    return <div className="bg-muted h-64 animate-pulse rounded-lg" />;
  }

  if (!progress) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Failed to load course details
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <h2 className="text-xl font-bold">{progress.courseTitle}</h2>
      </div>

      {/* Course overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <div className="text-muted-foreground text-xs">
                Overall Progress
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Progress
                  value={calculatePercentage(progress.lessons)}
                  className="flex-1"
                />
                <span className="font-medium">
                  {calculatePercentage(progress.lessons)}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Modules</div>
              <div className="font-medium">
                {progress.modules.completed}/{progress.modules.total}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Lessons</div>
              <div className="font-medium">
                {progress.lessons.completed}/{progress.lessons.total}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Time Spent</div>
              <div className="font-medium">
                {formatDuration(progress.timeSpentSeconds)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module breakdown */}
      <div className="space-y-4">
        {progress.moduleDetails.map((module) => {
          const moduleProgress = calculatePercentage(module.lessons);
          const moduleStatus = getProgressStatus(module.lessons);

          return (
            <Card key={module.moduleId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {module.moduleTitle}
                  </CardTitle>
                  <Badge
                    variant={
                      moduleStatus === "completed"
                        ? "success"
                        : moduleStatus === "in_progress"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {moduleProgress}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {module.lessonDetails.map((lesson) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {lesson.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : lesson.status === "in_progress" ? (
                          <PlayCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Circle className="text-muted-foreground h-5 w-5" />
                        )}
                        <div>
                          <div className="font-medium">
                            {lesson.lessonTitle}
                          </div>
                          {lesson.videoProgress && (
                            <div className="text-muted-foreground text-xs">
                              Video: {lesson.videoProgress.percentage}% watched
                            </div>
                          )}
                          {lesson.quizProgress && (
                            <div className="text-muted-foreground text-xs">
                              Quiz: {lesson.quizProgress.bestScore}% best score
                              ({lesson.quizProgress.attempts} attempts)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-muted-foreground text-xs">
                          {formatDuration(lesson.timeSpentSeconds)}
                        </div>
                        {lesson.completedAt && (
                          <div className="text-xs text-emerald-500">
                            {new Date(lesson.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
