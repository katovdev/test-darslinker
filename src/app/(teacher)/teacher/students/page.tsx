"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ChevronRight,
  Phone,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "@/hooks/use-locale";
import { teacherAPI, type TeacherStudent } from "@/lib/api";

export default function TeacherStudentsPage() {
  const t = useTranslations();
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(
    null
  );

  const loadStudents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await teacherAPI.getStudents({
        search: searchQuery || undefined,
      });
      if (response.success && response.data) {
        setStudents(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return (
      `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() ||
      "?"
    );
  };

  // Loading state
  if (isLoading && students.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32 bg-gray-700" />
        </div>
        <Skeleton className="h-12 w-full bg-gray-700" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {t("teacher.students")}
        </h1>
        <p className="mt-1 text-gray-400">{t("teacher.manageStudents")}</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("teacher.searchStudents")}
            className="border-gray-700 bg-gray-800 pl-10 text-white"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          {t("blog.search")}
        </Button>
      </form>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalStudents")}
              </p>
              <p className="text-xl font-bold text-white">{students.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-green-500/10 p-2">
              <BookOpen className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.totalEnrollments")}
              </p>
              <p className="text-xl font-bold text-white">
                {students.reduce((sum, s) => sum + s.enrollments.length, 0)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">
                {t("teacher.activeToday")}
              </p>
              <p className="text-xl font-bold text-white">
                {
                  students.filter((s) => {
                    if (!s.lastActiveAt) return false;
                    const lastActive = new Date(s.lastActiveAt);
                    const today = new Date();
                    return lastActive.toDateString() === today.toDateString();
                  }).length
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <Users className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button
              onClick={loadStudents}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!error && students.length === 0 && (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-800 p-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("teacher.noStudents")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("teacher.noStudentsDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students List */}
      {!error && students.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card className="border-gray-800 bg-gray-800/30">
              <CardHeader>
                <CardTitle className="text-white">
                  {t("teacher.allStudents")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors ${
                      selectedStudent?.id === student.id
                        ? "border border-[#7EA2D4]/30 bg-[#7EA2D4]/10"
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                        {student.avatarUrl && (
                          <AvatarImage src={student.avatarUrl} />
                        )}
                        <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                          {getInitials(student.firstName, student.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-400">
                          {student.enrollments.length}{" "}
                          {t("course.enrolledCourses")}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Student Detail */}
          <div>
            {selectedStudent ? (
              <Card className="border-gray-800 bg-gray-800/30">
                <CardHeader>
                  <CardTitle className="text-white">
                    {t("teacher.studentDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile */}
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                      {selectedStudent.avatarUrl && (
                        <AvatarImage src={selectedStudent.avatarUrl} />
                      )}
                      <AvatarFallback className="bg-transparent text-2xl font-medium text-white">
                        {getInitials(
                          selectedStudent.firstName,
                          selectedStudent.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 text-lg font-semibold text-white">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-gray-400">
                      <Phone className="h-3 w-3" />
                      {selectedStudent.phone}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <p className="text-2xl font-bold text-white">
                        {selectedStudent.enrollments.length}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t("teacher.courses")}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-800/50 p-3">
                      <p className="text-2xl font-bold text-white">
                        {selectedStudent.totalPayments.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">UZS</p>
                    </div>
                  </div>

                  {/* Enrollments */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-300">
                      {t("teacher.enrolledIn")}
                    </h4>
                    <div className="space-y-3">
                      {selectedStudent.enrollments.map((enrollment) => (
                        <div
                          key={enrollment.courseId}
                          className="rounded-lg bg-gray-800/50 p-3"
                        >
                          <p className="text-sm font-medium text-white">
                            {enrollment.courseName}
                          </p>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-400">
                                {t("course.progress")}
                              </span>
                              <span className="text-white">
                                {Math.round(enrollment.progress)}%
                              </span>
                            </div>
                            <Progress
                              value={enrollment.progress}
                              className="h-1.5 bg-gray-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Last Active */}
                  {selectedStudent.lastActiveAt && (
                    <p className="text-center text-xs text-gray-500">
                      {t("teacher.lastActive")}:{" "}
                      {new Date(selectedStudent.lastActiveAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-800 bg-gray-800/30">
                <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                  <Users className="h-12 w-12 text-gray-600" />
                  <p className="text-sm text-gray-400">
                    {t("teacher.selectStudent")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
