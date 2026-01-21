"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProgressTimeSeries } from "@/types/progress";

interface ProgressChartProps {
  data: ProgressTimeSeries[];
  title?: string;
  className?: string;
}

export function ProgressChart({
  data,
  title = "Progress Over Time",
  className,
}: ProgressChartProps) {
  const maxValue = React.useMemo(() => {
    const values = data.flatMap((d) => [
      d.enrollments,
      d.completions,
      d.activeUsers,
    ]);
    return Math.max(...values, 1);
  }, [data]);

  const chartHeight = 200;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-muted-foreground flex h-[200px] items-center justify-center text-sm">
            No data available
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple bar chart */}
            <div
              className="flex items-end gap-1"
              style={{ height: chartHeight }}
            >
              {data.map((item, index) => {
                const enrollmentHeight =
                  (item.enrollments / maxValue) * chartHeight;
                const completionHeight =
                  (item.completions / maxValue) * chartHeight;

                return (
                  <div
                    key={index}
                    className="group relative flex flex-1 flex-col items-center gap-1"
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-md bg-black/90 px-2 py-1 text-xs text-white group-hover:block">
                      <div>Date: {item.date}</div>
                      <div>Enrollments: {item.enrollments}</div>
                      <div>Completions: {item.completions}</div>
                      <div>Active: {item.activeUsers}</div>
                    </div>
                    {/* Bars */}
                    <div className="flex w-full items-end gap-0.5">
                      <div
                        className="flex-1 rounded-t bg-blue-500 transition-all hover:bg-blue-600"
                        style={{ height: Math.max(enrollmentHeight, 2) }}
                      />
                      <div
                        className="flex-1 rounded-t bg-emerald-500 transition-all hover:bg-emerald-600"
                        style={{ height: Math.max(completionHeight, 2) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-blue-500" />
                <span className="text-muted-foreground">Enrollments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-muted-foreground">Completions</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProgressDonutProps {
  completed: number;
  inProgress: number;
  notStarted: number;
  title?: string;
  className?: string;
}

export function ProgressDonut({
  completed,
  inProgress,
  notStarted,
  title = "Progress Distribution",
  className,
}: ProgressDonutProps) {
  const total = completed + inProgress + notStarted;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const notStartedPct = total > 0 ? (notStarted / total) * 100 : 0;

  // SVG donut chart calculations
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const completedDash = (completedPct / 100) * circumference;
  const inProgressDash = (inProgressPct / 100) * circumference;
  const notStartedDash = (notStartedPct / 100) * circumference;

  const completedOffset = 0;
  const inProgressOffset = -completedDash;
  const notStartedOffset = -(completedDash + inProgressDash);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          {/* Donut Chart */}
          <div className="relative">
            <svg width={size} height={size} className="-rotate-90">
              {/* Background circle */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted"
              />
              {/* Not started segment */}
              {notStartedPct > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${notStartedDash} ${circumference}`}
                  strokeDashoffset={notStartedOffset}
                  className="text-muted-foreground/30"
                />
              )}
              {/* In progress segment */}
              {inProgressPct > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${inProgressDash} ${circumference}`}
                  strokeDashoffset={inProgressOffset}
                  className="text-amber-500"
                />
              )}
              {/* Completed segment */}
              {completedPct > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${completedDash} ${circumference}`}
                  strokeDashoffset={completedOffset}
                  className="text-emerald-500"
                />
              )}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-muted-foreground text-xs">students</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Completed</span>
              <span className="ml-auto font-medium">{completed}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">In Progress</span>
              <span className="ml-auto font-medium">{inProgress}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-muted-foreground/30 h-3 w-3 rounded-full" />
              <span className="text-muted-foreground">Not Started</span>
              <span className="ml-auto font-medium">{notStarted}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressBarListProps {
  items: {
    label: string;
    value: number;
    total: number;
    color?: string;
  }[];
  title?: string;
  className?: string;
}

export function ProgressBarList({
  items,
  title = "Completion by Module",
  className,
}: ProgressBarListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => {
            const percentage =
              item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.label}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {item.value}/{item.total} ({percentage}%)
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      item.color || "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
