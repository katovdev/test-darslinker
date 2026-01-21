"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Eye,
  X,
} from "lucide-react";
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuDivider,
} from "@/components/ui/action-menu";
import { useTranslations } from "@/hooks/use-locale";
import { moderatorService } from "@/services/moderator";
import type { ModeratorUser, Pagination } from "@/lib/api/moderator";

type RoleFilter = "all" | "teacher" | "student" | "moderator" | "admin";
type StatusFilter = "all" | "pending" | "active" | "blocked";

export default function ModeratorUsersPage() {
  const t = useTranslations();
  const [users, setUsers] = useState<ModeratorUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ModeratorUser | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await moderatorService.listUsers({
        page,
        limit: 20,
        role: roleFilter === "all" ? undefined : roleFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
      });

      if (data) {
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        setError(t("moderator.statsLoadError") || "Failed to load users");
      }
    } catch {
      setError(t("moderator.statsLoadError") || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: "active" | "blocked"
  ) => {
    setIsUpdating(userId);

    const result = await moderatorService.updateUserStatus(userId, {
      status: newStatus,
    });
    if (result) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    }

    setIsUpdating(null);
  };

  const handleViewUser = (user: ModeratorUser) => {
    setSelectedUser(user);
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-500/10 text-red-400",
      moderator: "bg-orange-500/10 text-orange-400",
      teacher: "bg-blue-500/10 text-blue-400",
      student: "bg-green-500/10 text-green-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] || "bg-gray-500/10 text-gray-400"}`}
      >
        {role}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-500/10 text-green-400",
      pending: "bg-yellow-500/10 text-yellow-400",
      blocked: "bg-red-500/10 text-red-400",
    };
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-500/10 text-gray-400"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.users") || "Users"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.usersSubtitle") || "Manage user status"}
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {t("common.refresh") || "Refresh"}
        </button>
      </div>

      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
        <p className="text-sm text-yellow-400">
          {t("moderator.limitedUserAccess") ||
            "As a moderator, you can only change user status. Role changes and user deletion require admin access."}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchUsers") || "Search users..."}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {t("blog.search") || "Search"}
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as RoleFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">{t("admin.allRoles") || "All Roles"}</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="teacher">{t("admin.teacher") || "Teacher"}</option>
            <option value="student">{t("admin.student") || "Student"}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-green-500 focus:outline-none"
          >
            <option value="all">
              {t("admin.allStatuses") || "All Statuses"}
            </option>
            <option value="active">{t("admin.active") || "Active"}</option>
            <option value="pending">{t("admin.pending") || "Pending"}</option>
            <option value="blocked">{t("admin.suspended") || "Blocked"}</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  User
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Phone
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Role
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Joined
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-gray-700" />
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-2 text-gray-400">
                      {t("admin.noUsers") || "No users found"}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-teal-600 text-sm font-medium text-white">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.username && (
                            <p className="text-sm text-gray-500">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{user.phone}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu isLoading={isUpdating === user.id}>
                        <ActionMenuItem
                          onClick={() => handleViewUser(user)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View Details
                        </ActionMenuItem>

                        <ActionMenuDivider />

                        {user.status === "active" ? (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(user.id, "blocked")
                            }
                            icon={<UserX className="h-4 w-4" />}
                            variant="warning"
                          >
                            Block User
                          </ActionMenuItem>
                        ) : (
                          <ActionMenuItem
                            onClick={() =>
                              handleStatusChange(user.id, "active")
                            }
                            icon={<UserCheck className="h-4 w-4" />}
                            variant="success"
                          >
                            Activate User
                          </ActionMenuItem>
                        )}
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
            <p className="text-sm text-gray-400">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-50"
              >
                {t("blog.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {t("moderator.userDetails") || "User Details"}
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-teal-600 text-xl font-medium text-white">
                  {selectedUser.firstName?.charAt(0)}
                  {selectedUser.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-medium text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  {selectedUser.username && (
                    <p className="text-gray-400">@{selectedUser.username}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-900 p-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-white">{selectedUser.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="mt-1">{getRoleBadge(selectedUser.role)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="mt-1">{getStatusBadge(selectedUser.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="text-white">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {selectedUser.businessName && (
                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="text-white">{selectedUser.businessName}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 rounded-lg bg-gray-900 p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedUser.coursesCount}
                  </p>
                  <p className="text-sm text-gray-500">Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedUser.enrollmentsCount}
                  </p>
                  <p className="text-sm text-gray-500">Enrollments</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedUser.studentsCount}
                  </p>
                  <p className="text-sm text-gray-500">Students</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                {t("common.close") || "Close"}
              </button>
              {selectedUser.status === "active" ? (
                <button
                  onClick={() => {
                    handleStatusChange(selectedUser.id, "blocked");
                    setSelectedUser(null);
                  }}
                  className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                >
                  Block User
                </button>
              ) : (
                <button
                  onClick={() => {
                    handleStatusChange(selectedUser.id, "active");
                    setSelectedUser(null);
                  }}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Activate User
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
