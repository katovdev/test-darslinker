"use client";

import { useEffect, useState } from "react";
import {
  Users,
  RefreshCw,
  Search,
  GraduationCap,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { adminAPI, type AdminUser } from "@/lib/api";

type RoleFilter = "all" | "student" | "teacher" | "admin";
type StatusFilter = "all" | "active" | "suspended";

export default function AdminUsersPage() {
  const t = useTranslations();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminAPI.getUsers({
        search: searchQuery || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      if (response.success && response.data) {
        setUsers(response.data);
      }
    } catch (err) {
      setError(t("errors.generalError"));
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case "teacher":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
            <GraduationCap className="mr-1 h-3 w-3" />
            {t("admin.teacher")}
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20">
            <User className="mr-1 h-3 w-3" />
            {t("admin.student")}
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <Badge variant="outline" className="border-green-500/50 text-green-400">
          {t("admin.active")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-red-500/50 text-red-400">
        {t("admin.suspended")}
      </Badge>
    );
  };

  // Loading state
  if (isLoading && users.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 bg-gray-700" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1 bg-gray-700" />
          <Skeleton className="h-10 w-32 bg-gray-700" />
          <Skeleton className="h-10 w-32 bg-gray-700" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full bg-gray-700" />
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
            <Users className="h-8 w-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">
              {t("blog.errorTitle")}
            </h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
          <Button
            onClick={loadUsers}
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
        <h1 className="text-2xl font-bold text-white">{t("admin.users")}</h1>
        <p className="mt-1 text-gray-400">{t("admin.usersSubtitle")}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.searchUsers")}
            className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => setRoleFilter(v as RoleFilter)}
        >
          <SelectTrigger className="w-32 border-gray-700 bg-gray-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-gray-700 bg-gray-800">
            <SelectItem value="all" className="text-gray-300">
              {t("admin.allRoles")}
            </SelectItem>
            <SelectItem value="student" className="text-gray-300">
              {t("admin.student")}
            </SelectItem>
            <SelectItem value="teacher" className="text-gray-300">
              {t("admin.teacher")}
            </SelectItem>
            <SelectItem value="admin" className="text-gray-300">
              Admin
            </SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-32 border-gray-700 bg-gray-800 text-white">
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

      {/* Users List */}
      {users.length === 0 ? (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-700/50 p-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("admin.noUsers")}
              </h3>
              <p className="text-sm text-gray-400">{t("admin.noUsersDesc")}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-800 bg-gray-800/30">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-800">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
                      {user.avatarUrl && <AvatarImage src={user.avatarUrl} />}
                      <AvatarFallback className="bg-transparent text-sm font-medium text-white">
                        {getInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{user.phone}</p>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {/* Teacher info */}
                    {user.teacherProfile && (
                      <span className="text-sm text-gray-400">
                        @{user.teacherProfile.username} •{" "}
                        {user.teacherProfile.courseCount} {t("admin.courses")}
                      </span>
                    )}
                    {/* Student info */}
                    {user.studentProfile && (
                      <span className="text-sm text-gray-400">
                        {user.studentProfile.enrollmentCount}{" "}
                        {t("admin.enrollments")}
                      </span>
                    )}
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
