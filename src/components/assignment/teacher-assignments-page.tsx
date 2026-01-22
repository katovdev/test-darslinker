"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { GradingInterface } from "./grading-interface";
import {
  FileText,
  Loader2,
  Filter,
  CheckCircle,
  Clock,
  Users,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { assignmentsApi } from "@/lib/api/assignments";
import type {
  Assignment,
  AssignmentSubmission,
  TeacherAssignmentOverview,
} from "@/types/assignment";

type FilterStatus = "all" | "pending" | "graded";

export function TeacherAssignmentsPage() {
  const [overview, setOverview] = useState<TeacherAssignmentOverview | null>(
    null
  );
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, submissionsRes] = await Promise.all([
        assignmentsApi.getOverview(),
        assignmentsApi.listSubmissions({ limit: 100 }),
      ]);

      setOverview(overviewRes.data);
      setSubmissions(submissionsRes.data.items);
    } catch (error) {
      toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSubmission = async (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setLoadingAssignment(true);
    try {
      const { data } = await assignmentsApi.getAssignment(
        submission.assignmentId
      );
      setSelectedAssignment(data);
    } catch (error) {
      toast.error("Topshiriq ma'lumotlarini yuklashda xatolik");
      console.error(error);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    // Filter by status
    if (filter === "pending" && submission.grade !== null) return false;
    if (filter === "graded" && submission.grade === null) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentName = submission.student?.name?.toLowerCase() || "";
      const studentEmail = submission.student?.email?.toLowerCase() || "";
      return studentName.includes(query) || studentEmail.includes(query);
    }

    return true;
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Topshiriqlar"
          subtitle="Talabalar topshiriqlarini boshqarish va baholash"
        />

        {/* Stats */}
        {overview && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Jami topshiriqlar"
              value={overview.totalAssignments}
              icon={FileText}
              color="emerald"
            />
            <StatCard
              label="Baholanmagan"
              value={overview.pendingGrading}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              label="Bugun baholangan"
              value={overview.gradedToday}
              icon={CheckCircle}
              color="blue"
            />
            <StatCard
              label="O'rtacha ball"
              value={`${overview.averageGradeAllTime.toFixed(1)}%`}
              icon={Trophy}
              color="purple"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="border-gray-700 bg-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("all")}
                  className={
                    filter === "all"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Barchasi ({submissions.length})
                </Button>
                <Button
                  variant={filter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("pending")}
                  className={
                    filter === "pending"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Baholanmagan ({overview?.pendingGrading || 0})
                </Button>
                <Button
                  variant={filter === "graded" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter("graded")}
                  className={
                    filter === "graded"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Baholangan
                </Button>
              </div>
            </div>

            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Talaba yoki kurs nomi bo'yicha qidirish..."
            />
          </div>
        </Card>

        {/* Submissions List */}
        {isLoading ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Topshiriqlar topilmadi
            </h3>
            <p className="mt-2 text-gray-400">
              Talabalar tomonidan yuborilgan topshiriqlar bu yerda
              ko&apos;rinadi
            </p>
          </Card>
        ) : selectedSubmission ? (
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSubmission(null);
                setSelectedAssignment(null);
              }}
              className="mb-4 border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              ← Orqaga
            </Button>
            {loadingAssignment || !selectedAssignment ? (
              <Card className="border-gray-700 bg-gray-800 p-12 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
                <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
              </Card>
            ) : (
              <GradingInterface
                assignment={selectedAssignment}
                submission={selectedSubmission}
                onGradeSubmitted={() => {
                  fetchData();
                  setSelectedSubmission(null);
                  setSelectedAssignment(null);
                }}
              />
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSubmissions.map((submission) => {
              const isGraded = submission.grade !== null;

              return (
                <Card
                  key={submission.id}
                  className="border-gray-700 bg-gray-800 p-4 transition-colors hover:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                          <FileText className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">
                            {submission.student?.name || "Talaba"}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {submission.student?.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span>
                          Yuborildi: {formatDate(submission.submittedAt)}
                        </span>
                        {isGraded && submission.grade !== undefined && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-400">
                              Ball: {submission.grade}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isGraded ? (
                        <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Baholangan
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-yellow-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Baholanmagan
                          </span>
                        </div>
                      )}

                      <Button
                        onClick={() => handleSelectSubmission(submission)}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        {isGraded ? "Ko'rish" : "Baholash"}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
