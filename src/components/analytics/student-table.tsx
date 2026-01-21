"use client";

import * as React from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ArrowUpDown,
  Eye,
  User,
} from "lucide-react";
import type { StudentOverview, ProgressFilters } from "@/types/progress";
import { formatDuration, calculatePercentage } from "@/types/progress";

interface SortHeaderProps {
  field: ProgressFilters["sortBy"];
  currentSortBy?: ProgressFilters["sortBy"];
  onSort: (field: ProgressFilters["sortBy"]) => void;
  children: React.ReactNode;
}

function SortHeader({
  field,
  currentSortBy,
  onSort,
  children,
}: SortHeaderProps) {
  return (
    <button
      onClick={() => onSort(field)}
      className="hover:text-foreground flex items-center gap-1"
    >
      {children}
      <ArrowUpDown
        className={cn(
          "h-3 w-3",
          currentSortBy === field ? "text-foreground" : "text-muted-foreground"
        )}
      />
    </button>
  );
}

interface StudentTableProps {
  students: StudentOverview[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: ProgressFilters;
  onFiltersChange?: (filters: ProgressFilters) => void;
  onStudentClick?: (userId: string) => void;
  loading?: boolean;
  className?: string;
}

export function StudentTable({
  students,
  pagination,
  filters = {},
  onFiltersChange,
  onStudentClick,
  loading,
  className,
}: StudentTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSort = (field: ProgressFilters["sortBy"]) => {
    if (!onFiltersChange) return;
    const newOrder =
      filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";
    onFiltersChange({ ...filters, sortBy: field, sortOrder: newOrder });
  };

  const handlePageChange = (page: number) => {
    if (!onFiltersChange) return;
    onFiltersChange({ ...filters, page });
  };

  const handleStatusFilter = (status: string) => {
    if (!onFiltersChange) return;
    const statusFilter =
      status === "all"
        ? undefined
        : ([status] as ("not_started" | "in_progress" | "completed")[]);
    onFiltersChange({ ...filters, status: statusFilter, page: 1 });
  };

  const filteredStudents = React.useMemo(() => {
    if (!searchQuery) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (s) =>
        s.userName.toLowerCase().includes(query) ||
        s.userEmail.toLowerCase().includes(query)
    );
  }, [students, searchQuery]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Student Progress</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full pl-8 sm:w-[200px]"
              />
            </div>
            {/* Status filter */}
            <Select
              value={filters.status?.[0] || "all"}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="h-9 w-full sm:w-[140px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <SortHeader
                    field="name"
                    currentSortBy={filters.sortBy}
                    onSort={handleSort}
                  >
                    Student
                  </SortHeader>
                </TableHead>
                <TableHead>
                  <SortHeader
                    field="progress"
                    currentSortBy={filters.sortBy}
                    onSort={handleSort}
                  >
                    Progress
                  </SortHeader>
                </TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Avg. Score</TableHead>
                <TableHead className="text-right">Time Spent</TableHead>
                <TableHead>
                  <SortHeader
                    field="lastActive"
                    currentSortBy={filters.sortBy}
                    onSort={handleSort}
                  >
                    Last Active
                  </SortHeader>
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="text-muted-foreground">Loading...</div>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="text-muted-foreground">
                      No students found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const avgProgress =
                    student.coursesProgress.length > 0
                      ? Math.round(
                          student.coursesProgress.reduce((sum, cp) => {
                            return sum + calculatePercentage(cp.lessons);
                          }, 0) / student.coursesProgress.length
                        )
                      : 0;

                  return (
                    <TableRow
                      key={student.userId}
                      className={cn(
                        onStudentClick && "hover:bg-muted/50 cursor-pointer"
                      )}
                      onClick={() => onStudentClick?.(student.userId)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="relative h-8 w-8 overflow-hidden">
                            {student.userAvatar ? (
                              <Image
                                src={student.userAvatar}
                                alt={student.userName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="bg-muted flex h-full w-full items-center justify-center">
                                <User className="text-muted-foreground h-4 w-4" />
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.userName}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {student.userEmail}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={avgProgress} className="w-20" />
                          <span className="text-muted-foreground text-xs">
                            {avgProgress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="space-x-1">
                          <Badge variant="success">
                            {student.completedCourses}
                          </Badge>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground text-sm">
                            {student.enrolledCourses}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            student.averageQuizScore >= 80
                              ? "success"
                              : student.averageQuizScore >= 60
                                ? "warning"
                                : "destructive"
                          }
                        >
                          {Math.round(student.averageQuizScore)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground text-sm">
                          {formatDuration(student.totalTimeSpentSeconds)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-xs">
                          {new Date(student.lastActiveAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStudentClick?.(student.userId);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} students
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.page ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                }
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
