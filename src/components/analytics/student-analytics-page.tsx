"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { StatCard } from "@/components/ui/stat-card";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Loader2,
  TrendingUp,
  BookOpen,
  Calendar,
  Mail,
  Phone,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { teacherApi, type StudentAnalytics } from "@/lib/api/teacher";

export function StudentAnalyticsPage() {
  const [students, setStudents] = useState<StudentAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const { data } = await teacherApi.getStudentAnalytics();
      setStudents(data);
    } catch (error) {
      toast.error("Tahlillarni yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate analytics from students data
  const analytics = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.isActive).length,
    averageProgress:
      students.length > 0
        ? students.reduce((sum, s) => sum + s.avgProgress, 0) / students.length
        : 0,
    totalEnrollments: students.reduce(
      (sum, s) => sum + s.enrolledCourses.length,
      0
    ),
  };

  const filteredStudents = students.filter((student) => {
    // Filter by status
    if (statusFilter === "active" && !student.isActive) return false;
    if (statusFilter === "inactive" && student.isActive) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nameMatch = student.name.toLowerCase().includes(query);
      const emailMatch = student.email?.toLowerCase().includes(query);
      const phoneMatch = student.phone?.includes(query);
      return nameMatch || emailMatch || phoneMatch;
    }

    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleExport = () => {
    if (!filteredStudents || filteredStudents.length === 0) {
      toast.error("Eksport qilish uchun ma'lumot yo'q");
      return;
    }

    // Create CSV content
    const headers = [
      "Ism",
      "Email",
      "Telefon",
      "Kurslar soni",
      "O'rtacha progress",
      "Faol",
      "Ro'yxatdan o'tgan",
    ];
    const rows = filteredStudents.map((student) => [
      student.name,
      student.email || "-",
      student.phone || "-",
      student.enrolledCourses.length,
      `${student.avgProgress}%`,
      student.isActive ? "Ha" : "Yo'q",
      formatDate(student.joinedAt),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `talabalar-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Ma'lumotlar eksport qilindi");
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          title="Talabalar tahlili"
          subtitle="Talabalar va ularning kurs progresslarini kuzatish"
        />

        {/* Stats */}
        {analytics && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Jami talabalar"
              value={analytics.totalStudents}
              icon={Users}
              color="emerald"
            />
            <StatCard
              label="Faol talabalar"
              value={analytics.activeStudents}
              icon={TrendingUp}
              color="blue"
            />
            <StatCard
              label="Jami ro'yxatlar"
              value={analytics.totalEnrollments}
              icon={BookOpen}
              color="purple"
            />
            <StatCard
              label="O'rtacha progress"
              value={`${analytics.averageProgress.toFixed(1)}%`}
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
                  Barchasi ({students.length})
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                  className={
                    statusFilter === "active"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Faol ({analytics?.activeStudents || 0})
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                  className={
                    statusFilter === "inactive"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
                  }
                >
                  Nofaol
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
              placeholder="Ism, email yoki telefon bo'yicha qidirish..."
            />
          </div>
        </Card>

        {/* Students Table */}
        {isLoading ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-4 text-gray-400">Yuklanmoqda...</p>
          </Card>
        ) : !filteredStudents || filteredStudents.length === 0 ? (
          <Card className="border-gray-700 bg-gray-800 p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold text-white">
              Talabalar topilmadi
            </h3>
            <p className="mt-2 text-gray-400">
              Sizning kurslaringizga yozilgan talabalar bu yerda ko&apos;rinadi
            </p>
          </Card>
        ) : (
          <Card className="border-gray-700 bg-gray-800 p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700/50">
                    <TableHead className="text-white">Talaba</TableHead>
                    <TableHead className="text-white">Aloqa</TableHead>
                    <TableHead className="text-center text-white">
                      Kurslar
                    </TableHead>
                    <TableHead className="text-center text-white">
                      O&apos;rtacha progress
                    </TableHead>
                    <TableHead className="text-center text-white">
                      Holat
                    </TableHead>
                    <TableHead className="text-white">
                      Ro&apos;yxatdan o&apos;tgan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="border-gray-700 hover:bg-gray-700/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            alt={student.name}
                            fallback={student.name}
                            className="h-10 w-10"
                          />
                          <span className="font-medium text-white">
                            {student.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-gray-400">
                          {student.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold text-white">
                          {student.enrolledCourses.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-white">
                            {student.avgProgress}%
                          </span>
                          <div className="mt-1 h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${student.avgProgress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {student.isActive ? (
                          <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                            Faol
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 px-2 py-1 text-xs font-medium text-gray-400">
                            Nofaol
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {formatDate(student.joinedAt)}
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
        {filteredStudents && filteredStudents.length > 0 && (
          <Card className="border-gray-700 bg-gray-800 p-4">
            <p className="text-sm text-gray-400">
              Ko&apos;rsatilmoqda:{" "}
              <span className="font-semibold text-white">
                {filteredStudents.length}
              </span>{" "}
              talaba
              {searchQuery && " (qidiruv bo'yicha)"}
              {statusFilter !== "all" && " (filtr qo'llanilgan)"}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
