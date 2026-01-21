"use client";

import { useEffect, useState } from "react";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { StudentDetail } from "@/components/analytics/student-detail";
import { teacherService } from "@/services/teacher";
import { Loader2 } from "lucide-react";
import type { TeacherCourse } from "@/lib/api/teacher";

export default function TeacherAnalyticsPage() {
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const data = await teacherService.listCourses({ limit: 100 });
        if (data) {
          setCourses(
            data.courses.map((c: TeacherCourse) => ({
              id: c.id,
              title: c.title,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <StudentDetail
        userId={selectedStudent}
        onBack={() => setSelectedStudent(null)}
      />
    );
  }

  return (
    <AnalyticsDashboard
      courses={courses}
      onStudentClick={(userId) => setSelectedStudent(userId)}
    />
  );
}
