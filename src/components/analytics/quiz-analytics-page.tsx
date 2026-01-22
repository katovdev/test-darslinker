"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HelpCircle,
  Loader2,
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  XCircle,
  Download,
  Calendar,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  teacherApi,
  type QuizAnalytics,
  type QuizAnalyticsResult,
} from "@/lib/api/teacher";

export function QuizAnalyticsPage() {
  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "passed" | "failed">(
    "all"
  );

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data } = await teacherApi.getQuizAnalytics();
      setAnalytics(data);
    } catch (error) {
      toast.error("Tahlillarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = analytics?.results.filter((result) => {
    // Filter by status
    if (statusFilter === "passed" && !result.passed) return false;
    if (statusFilter === "failed" && result.passed) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const studentMatch = result.studentName.toLowerCase().includes(query);
      const courseMatch = result.courseName.toLowerCase().includes(query);
      const quizMatch = result.quizTitle.toLowerCase().includes(query);
      return studentMatch || courseMatch || quizMatch;
    }

    return true;
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExport = () => {
    if (!filteredResults || filteredResults.length === 0) {
      toast.error("Eksport qilish uchun ma'lumot yo'q");
      return;
    }

    // Create CSV content
    const headers = [
      "Talaba",
      "Kurs",
      "Test",
      "Urinish",
      "Ball",
      "Foiz",
      "Holat",
      "Vaqt",
      "Sana",
    ];
    const rows = filteredResults.map((result) => [
      result.studentName,
      result.courseName,
      result.quizTitle,
      result.attemptNumber,
      result.score,
      `${result.score}%`,
      result.passed ? "O'tdi" : "O'tmadi",
      formatDuration(result.timeTaken),
      formatDate(result.submittedAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `test-natijalari-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Natijalar eksport qilindi");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Test natijalari"
          subtitle="Talabalar test natijalarini tahlil qilish va kuzatish"
        />

        {/* Stats */}
        {analytics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Jami urinishlar"
              value={analytics.totalAttempts}
              icon={HelpCircle}
              color="emerald"
            />
            <StatCard
              label="Talabalar soni"
              value={analytics.studentCount}
              icon={Users}
              color="blue"
            />
            <StatCard
              label="O'rtacha ball"
              value={`${analytics.avgScore.toFixed(1)}%`}
              icon={Target}
              color="purple"
            />
            <StatCard
              label="O'tish darajasi"
              value={`${analytics.passRate.toFixed(1)}%`}
              icon={TrendingUp}
              color="yellow"
            />
          </div>
        )}

        {/* Filters */}
        <Card className="border-gray-700 bg-gray-800 p-4">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                  className={
                    statusFilter === "all"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Barchasi ({analytics?.results.length || 0})
                </Button>
                <Button
                  variant={statusFilter === "passed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("passed")}
                  className={
                    statusFilter === "passed"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  O&apos;tganlar
                </Button>
                <Button
                  variant={statusFilter === "failed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("failed")}
                  className={
                    statusFilter === "failed"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  O&apos;tmaganlar
                </Button>
              </div>

              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="ml-auto border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
              >
                <Download className="mr-2 h-4 w-4" />
                Eksport (CSV)
              </Button>
            </div>

            <SearchInput
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Talaba, kurs yoki test nomi bo'yicha qidirish..."
            />
          </div>
        </Card>

        {/* Results Table */}
        {isLoading ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
          </Card>
        ) : !filteredResults || filteredResults.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <HelpCircle className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Natijalar topilmadi
            </h3>
            <p className="mt-2 text-gray-400">
              Talabalar test natijalarini bu yerda ko&apos;rasiz
            </p>
          </Card>
        ) : (
          <Card className="border-gray-700 bg-gray-800 p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700/50">
                    <TableHead className="text-white">Talaba</TableHead>
                    <TableHead className="text-white">Kurs</TableHead>
                    <TableHead className="text-white">Test</TableHead>
                    <TableHead className="text-center text-white">
                      Urinish
                    </TableHead>
                    <TableHead className="text-center text-white">
                      Ball
                    </TableHead>
                    <TableHead className="text-center text-white">
                      Holat
                    </TableHead>
                    <TableHead className="text-center text-white">
                      Vaqt
                    </TableHead>
                    <TableHead className="text-white">Sana</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <TableRow
                      key={result.id}
                      className="border-gray-700 hover:bg-gray-700/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-semibold text-emerald-500">
                            {result.studentName.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-white">
                            {result.studentName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {result.courseName}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {result.quizTitle}
                      </TableCell>
                      <TableCell className="text-center text-gray-300">
                        {result.attemptNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-white">
                          {result.score}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {result.passed ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                            <CheckCircle className="h-3 w-3" />
                            O&apos;tdi
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400">
                            <XCircle className="h-3 w-3" />
                            O&apos;tmadi
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1 text-gray-300">
                          <Clock className="h-3 w-3" />
                          {formatDuration(result.timeTaken)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(result.submittedAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* Summary */}
        {filteredResults && filteredResults.length > 0 && (
          <Card className="border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">
              Ko&apos;rsatilmoqda:{" "}
              <span className="font-semibold text-white">
                {filteredResults.length}
              </span>{" "}
              natija
              {searchQuery && " (qidiruv bo'yicha)"}
              {statusFilter !== "all" && " (filtr qo'llanilgan)"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
