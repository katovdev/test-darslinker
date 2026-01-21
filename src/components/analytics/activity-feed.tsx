"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  PlayCircle,
  CheckCircle2,
  Trophy,
  BookOpen,
  Award,
  Clock,
  FileQuestion,
} from "lucide-react";
import type { ProgressEvent, ProgressEventType } from "@/types/progress";

interface ActivityFeedProps {
  events: ProgressEvent[];
  maxHeight?: number;
  showAll?: boolean;
  className?: string;
}

const EVENT_CONFIG: Record<
  ProgressEventType,
  { icon: React.ReactNode; label: string; color: string }
> = {
  lesson_started: {
    icon: <PlayCircle className="h-4 w-4" />,
    label: "Started lesson",
    color: "text-blue-500",
  },
  lesson_completed: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Completed lesson",
    color: "text-emerald-500",
  },
  video_progress: {
    icon: <Clock className="h-4 w-4" />,
    label: "Watched video",
    color: "text-purple-500",
  },
  quiz_attempt: {
    icon: <FileQuestion className="h-4 w-4" />,
    label: "Attempted quiz",
    color: "text-amber-500",
  },
  quiz_passed: {
    icon: <Trophy className="h-4 w-4" />,
    label: "Passed quiz",
    color: "text-emerald-500",
  },
  module_completed: {
    icon: <BookOpen className="h-4 w-4" />,
    label: "Completed module",
    color: "text-emerald-500",
  },
  course_completed: {
    icon: <Trophy className="h-4 w-4" />,
    label: "Completed course",
    color: "text-emerald-500",
  },
  certificate_issued: {
    icon: <Award className="h-4 w-4" />,
    label: "Received certificate",
    color: "text-amber-500",
  },
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export function ActivityFeed({
  events,
  maxHeight = 400,
  showAll = false,
  className,
}: ActivityFeedProps) {
  const displayEvents = showAll ? events : events.slice(0, 10);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {events.length === 0 ? (
          <div className="text-muted-foreground px-6 py-8 text-center text-sm">
            No recent activity
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            <div className="space-y-0 px-6 pb-4">
              {displayEvents.map((event, index) => {
                const config = EVENT_CONFIG[event.type];
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "relative flex gap-3 py-3",
                      index !== displayEvents.length - 1 && "border-b"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "mt-0.5 shrink-0 rounded-full p-1.5",
                        config.color,
                        config.color.replace("text-", "bg-") + "/10"
                      )}
                    >
                      {config.icon}
                    </div>
                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{config.label}</span>
                        {event.metadata?.title !== undefined && (
                          <>
                            :{" "}
                            <span className="text-muted-foreground">
                              {String(event.metadata.title)}
                            </span>
                          </>
                        )}
                      </p>
                      <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                        <span>{formatRelativeTime(event.timestamp)}</span>
                        {event.metadata?.score !== undefined && (
                          <>
                            <span>•</span>
                            <span>Score: {String(event.metadata.score)}%</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

interface ActivityTimelineProps {
  events: ProgressEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const groups: Record<string, ProgressEvent[]> = {};
    events.forEach((event) => {
      const date = new Date(event.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  }, [events]);

  return (
    <div className={cn("space-y-6", className)}>
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date}>
          <div className="text-muted-foreground mb-3 text-xs font-medium">
            {date}
          </div>
          <div className="relative space-y-0 pl-6">
            {/* Vertical line */}
            <div className="bg-border absolute top-0 bottom-0 left-2 w-px" />

            {dateEvents.map((event) => {
              const config = EVENT_CONFIG[event.type];
              return (
                <div key={event.id} className="relative pb-4">
                  {/* Dot */}
                  <div
                    className={cn(
                      "absolute top-1 -left-4 h-2 w-2 rounded-full",
                      config.color.replace("text-", "bg-")
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-medium", config.color)}>
                        {config.label}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {event.metadata?.title !== undefined && (
                      <p className="text-muted-foreground text-sm">
                        {String(event.metadata.title)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
