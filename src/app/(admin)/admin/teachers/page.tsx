"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  RefreshCw,
  Search,
  ExternalLink,
  Users,
  BookOpen,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "@/hooks/use-locale";
import { adminAPI, type AdminTeacher } from "@/lib/api";

type StatusFilter = "all" | "active" | "suspended";

export default function AdminTeachersPage() {
  const t = useTranslations();
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacher | null>(
    null
  );

  const loadTeachers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getTeachers({
        search: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (response.success && response.data) {
        setTeachers(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load teachers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadTeachers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20">
          {t("admin.active")}
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-500/10 text-red-400 hover:bg-red-500/20">
        {t("admin.suspended")}
      </Badge>
    );
  };

  // Loading state
  if (isLoading && teachers.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 bg-gray-700" />
          <Skeleton className="h-10 w-40 bg-gray-700" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full bg-gray-700" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-gray-800 bg-gray-800/30">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <GraduationCap className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadTeachers}
            variant="outline"
            className="gap-2 border-gray-700 text-white hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t("admin.teachers")}</h1>
        <p className="mt-1 text-gray-400">{t("admin.teachersSubtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.searchTeachers")}
            className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-40 border-gray-700 bg-gray-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="all" className="text-gray-300">
              {t("admin.allStatuses")}
            </SelectItem>
            <SelectItem value="active" className="text-gray-300">
              {t("admin.active")}
            </SelectItem>
            <SelectItem value="suspended" className="text-gray-300">
              {t("admin.suspended")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teachers Grid */}
      {teachers.length === 0 ? (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-700/50 p-4">
              <GraduationCap className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("admin.noTeachers")}
              </h3>
              <p className="text-sm text-gray-400">
                {t("admin.noTeachersDesc")}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="border-gray-800 bg-gray-800/30 transition-colors hover:bg-gray-800/50"
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-700">
                      {teacher.avatarUrl && (
                        <AvatarImage src={teacher.avatarUrl} />
                      )}
                      <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                        {getInitials(teacher.firstName, teacher.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        @{teacher.username}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(teacher.status)}
                </div>

                {/* Business Name */}
                {teacher.businessName && (
                  <p className="mt-3 text-sm text-gray-400">
                    {teacher.businessName}
                  </p>
                )}

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-800/50 p-3">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                      <span className="text-lg font-bold text-white">
                        {teacher.courseCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("admin.courses")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-green-400" />
                      <span className="text-lg font-bold text-white">
                        {teacher.studentCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("admin.students")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                      <span className="text-lg font-bold text-white">
                        {(teacher.totalRevenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {t("admin.revenue")}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-4">
                  <p className="text-xs text-gray-500">
                    {t("admin.joined")}:{" "}
                    {new Date(teacher.createdAt).toLocaleDateString()}
                  </p>
                  <a
                    href={`https://${teacher.username}.darslinker.uz`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#7EA2D4] hover:underline"
                  >
                    {t("admin.visitSite")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
