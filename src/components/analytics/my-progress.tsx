"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Trophy,
  Clock,
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  PlayCircle,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyProgress, useCourseProgressDetail } from "@/hooks/use-progress";
import {
  formatDuration,
  calculatePercentage,
  getProgressStatus,
  getProgressColor,
} from "@/types/progress";
import type { CourseProgress } from "@/types/progress";

interface MyProgressProps {
  onContinueLearning?: (courseId: string, lessonId?: string) => void;
  className?: string;
}

export function MyProgress({ onContinueLearning, className }: MyProgressProps) {
  const { courses, loading, error } = useMyProgress();
  const [selectedCourse, setSelectedCourse] = React.useState<string | null>(
    null
  );

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-32 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Failed to load your progress
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpen className="text-muted-foreground mx-auto h-12 w-12" />
        <h3 className="mt-4 font-medium">No courses enrolled</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Start learning by enrolling in a course
        </p>
      </div>
    );
  }

  // Summary stats
  const totalCourses = courses.length;
  const completedCourses = courses.filter(
    (c) => c.status === "completed"
  ).length;
  const inProgressCourses = courses.filter(
    (c) => c.status === "in_progress"
  ).length;
  const totalTimeSpent = courses.reduce(
    (sum, c) => sum + c.timeSpentSeconds,
    0
  );

  if (selectedCourse) {
    return (
      <CourseProgressView
        courseId={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onContinueLearning={onContinueLearning}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <BookOpen className="text-primary h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <div className="text-muted-foreground text-xs">
                  Enrolled Courses
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2">
                <Trophy className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedCourses}</div>
                <div className="text-muted-foreground text-xs">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-500/10 p-2">
                <Play className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{inProgressCourses}</div>
                <div className="text-muted-foreground text-xs">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-2">
                <Clock className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatDuration(totalTimeSpent)}
                </div>
                <div className="text-muted-foreground text-xs">Time Spent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      {inProgressCourses > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Continue Learning</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.status === "in_progress")
              .slice(0, 3)
              .map((course) => (
                <CourseProgressCard
                  key={course.courseId}
                  course={course}
                  onViewDetails={() => setSelectedCourse(course.courseId)}
                  onContinue={() => onContinueLearning?.(course.courseId)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Completed Courses */}
      {completedCourses > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Completed Courses</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses
              .filter((c) => c.status === "completed")
              .map((course) => (
                <CourseProgressCard
                  key={course.courseId}
                  course={course}
                  onViewDetails={() => setSelectedCourse(course.courseId)}
                />
              ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div className="space-y-3">
        <h2 className="font-semibold">All Enrolled Courses</h2>
        <div className="space-y-2">
          {courses.map((course) => (
            <CourseListItem
              key={course.courseId}
              course={course}
              onSelect={() => setSelectedCourse(course.courseId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CourseProgressCardProps {
  course: CourseProgress;
  onViewDetails: () => void;
  onContinue?: () => void;
}

function CourseProgressCard({
  course,
  onViewDetails,
  onContinue,
}: CourseProgressCardProps) {
  const progress = calculatePercentage(course.lessons);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h3 className="line-clamp-2 font-medium">{course.courseTitle}</h3>
            <div className="text-muted-foreground mt-1 text-xs">
              {course.modules.completed}/{course.modules.total} modules •{" "}
              {course.lessons.completed}/{course.lessons.total} lessons
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className={cn("font-medium", getProgressColor(progress))}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} />
          </div>

          <div className="flex items-center gap-2">
            {onContinue && progress < 100 && (
              <Button className="flex-1" onClick={onContinue}>
                <Play className="mr-2 h-4 w-4" />
                Continue
              </Button>
            )}
            <Button
              variant={onContinue && progress < 100 ? "outline" : "default"}
              className={cn(!onContinue || progress >= 100 ? "flex-1" : "")}
              onClick={onViewDetails}
            >
              View Details
            </Button>
          </div>

          {course.certificateId && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-600">
              <Award className="h-4 w-4" />
              Certificate earned
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CourseListItemProps {
  course: CourseProgress;
  onSelect: () => void;
}

function CourseListItem({ course, onSelect }: CourseListItemProps) {
  const progress = calculatePercentage(course.lessons);
  const status = getProgressStatus(course.lessons);

  return (
    <div
      className="hover:bg-muted/50 flex cursor-pointer items-center gap-4 rounded-lg border p-4 transition-colors"
      onClick={onSelect}
    >
      <div className="shrink-0">
        {status === "completed" ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : status === "in_progress" ? (
          <PlayCircle className="h-6 w-6 text-blue-500" />
        ) : (
          <Circle className="text-muted-foreground h-6 w-6" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{course.courseTitle}</div>
        <div className="text-muted-foreground text-xs">
          {course.lessons.completed}/{course.lessons.total} lessons completed •{" "}
          {formatDuration(course.timeSpentSeconds)}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24">
          <Progress value={progress} />
        </div>
        <span className={cn("text-sm font-medium", getProgressColor(progress))}>
          {progress}%
        </span>
        <ChevronRight className="text-muted-foreground h-5 w-5" />
      </div>
    </div>
  );
}

interface CourseProgressViewProps {
  courseId: string;
  onBack: () => void;
  onContinueLearning?: (courseId: string, lessonId?: string) => void;
  className?: string;
}

function CourseProgressView({
  courseId,
  onBack,
  onContinueLearning,
  className,
}: CourseProgressViewProps) {
  const { progress, loading } = useCourseProgressDetail(courseId);

  if (loading) {
    return <div className="bg-muted h-64 animate-pulse rounded-lg" />;
  }

  if (!progress) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        Failed to load course progress
      </div>
    );
  }

  const overallProgress = calculatePercentage(progress.lessons);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{progress.courseTitle}</h1>
          <p className="text-muted-foreground text-sm">
            {progress.lessons.completed}/{progress.lessons.total} lessons
            completed
          </p>
        </div>
        {overallProgress < 100 && onContinueLearning && (
          <Button onClick={() => onContinueLearning(courseId)}>
            <Play className="mr-2 h-4 w-4" />
            Continue Learning
          </Button>
        )}
      </div>

      {/* Overall progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Overall Progress</span>
              <span
                className={cn(
                  "text-lg font-bold",
                  getProgressColor(overallProgress)
                )}
              >
                {overallProgress}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium">{progress.modules.completed}</div>
                <div className="text-muted-foreground text-xs">
                  Modules Completed
                </div>
              </div>
              <div>
                <div className="font-medium">{progress.lessons.completed}</div>
                <div className="text-muted-foreground text-xs">
                  Lessons Completed
                </div>
              </div>
              <div>
                <div className="font-medium">
                  {formatDuration(progress.timeSpentSeconds)}
                </div>
                <div className="text-muted-foreground text-xs">Time Spent</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-4">
        {progress.moduleDetails.map((module, moduleIndex) => {
          const moduleProgress = calculatePercentage(module.lessons);
          const isCompleted = module.status === "completed";

          return (
            <Card key={module.moduleId}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    <CardTitle className="text-base">
                      {module.moduleTitle}
                    </CardTitle>
                  </div>
                  <Badge
                    variant={
                      isCompleted
                        ? "success"
                        : module.status === "in_progress"
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
                  {module.lessonDetails.map((lesson) => {
                    const isLessonComplete = lesson.status === "completed";
                    const isInProgress = lesson.status === "in_progress";

                    return (
                      <div
                        key={lesson.lessonId}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3",
                          isInProgress && "border-blue-500/50 bg-blue-500/5"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {isLessonComplete ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                          ) : isInProgress ? (
                            <PlayCircle className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Circle className="text-muted-foreground h-5 w-5" />
                          )}
                          <div>
                            <div className="font-medium">
                              {lesson.lessonTitle}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-2 text-xs">
                              {lesson.videoProgress && (
                                <span>
                                  Video: {lesson.videoProgress.percentage}%
                                </span>
                              )}
                              {lesson.quizProgress && (
                                <span>
                                  Quiz: {lesson.quizProgress.bestScore}%
                                </span>
                              )}
                              {lesson.timeSpentSeconds > 0 && (
                                <span>
                                  {formatDuration(lesson.timeSpentSeconds)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isLessonComplete && onContinueLearning && (
                          <Button
                            size="sm"
                            variant={isInProgress ? "default" : "outline"}
                            onClick={() =>
                              onContinueLearning(courseId, lesson.lessonId)
                            }
                          >
                            {isInProgress ? "Continue" : "Start"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
