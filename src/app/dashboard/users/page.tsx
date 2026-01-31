"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  Eye,
  X,
  Plus,
  GraduationCap,
  ShieldAlert,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { useAuth } from "@/context/auth-context";
import { adminService } from "@/services/admin";
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuDivider,
} from "@/components/ui/action-menu";
import type { AdminUser, Pagination } from "@/lib/api/admin";

type RoleFilter = "all" | "teacher" | "student" | "moderator" | "admin";
type StatusFilter = "all" | "pending" | "active" | "blocked";

function DashboardUsersContent() {
  const t = useTranslations();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    status: string;
  } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    id: "",
    phone: "",
    firstName: "",
    lastName: "",
    role: "student" as "teacher" | "student" | "moderator" | "admin",
    status: "active" as "pending" | "active" | "blocked",
    username: "",
    businessName: "",
    specialization: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await adminService.listUsers({
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
        setError(t("admin.statsLoadError") || "Failed to load users");
      }
    } catch {
      setError(t("admin.statsLoadError") || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const result = await adminService.updateUser(userId, { status: newStatus });
    if (result) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
    }

    setIsUpdating(null);
  };

  const handleRoleChange = async (
    userId: string,
    newRole: "teacher" | "student" | "moderator" | "admin"
  ) => {
    setIsUpdating(userId);

    const result = await adminService.updateUser(userId, { role: newRole });
    if (result) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    }

    setIsUpdating(null);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setIsUpdating(userId);

    const result = await adminService.deleteUser(userId);
    if (result) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }

    setIsUpdating(null);
  };

  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setEditingUser({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });
  };

  const handleSaveUser = async () => {
    if (!selectedUser || !editingUser) return;

    setIsUpdating(selectedUser.id);

    const result = await adminService.updateUser(selectedUser.id, {
      firstName: editingUser.firstName,
      lastName: editingUser.lastName,
      role: editingUser.role as "teacher" | "student" | "moderator" | "admin",
      status: editingUser.status as "active" | "blocked" | "pending",
    });

    if (result) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                firstName: editingUser.firstName,
                lastName: editingUser.lastName,
                role: editingUser.role as
                  | "teacher"
                  | "student"
                  | "moderator"
                  | "admin",
                status: editingUser.status as "active" | "blocked" | "pending",
              }
            : u
        )
      );
      setSelectedUser(null);
      setEditingUser(null);
    }

    setIsUpdating(null);
  };

  const handleCreateUser = async () => {
    if (
      !newUser.id ||
      !newUser.phone ||
      !newUser.firstName ||
      !newUser.lastName
    ) {
      return;
    }

    setIsCreating(true);

    const result = await adminService.createUser({
      id: newUser.id,
      phone: newUser.phone,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      status: newUser.status,
      username: newUser.username || undefined,
      businessName: newUser.businessName || undefined,
      specialization: newUser.specialization || undefined,
    });

    if (result) {
      setUsers((prev) => [result, ...prev]);
      setShowCreateModal(false);
      setNewUser({
        id: "",
        phone: "",
        firstName: "",
        lastName: "",
        role: "student",
        status: "active",
        username: "",
        businessName: "",
        specialization: "",
      });
    }

    setIsCreating(false);
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
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[role] || "bg-muted text-muted-foreground"}`}
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
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.users") || "Users"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("admin.usersSubtitle") || "Manage all users"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t("admin.addUser") || "Add User"}
          </button>
          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh") || "Refresh"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("admin.searchUsers") || "Search users..."}
              className="w-full rounded-lg border border-border bg-secondary py-2 pr-4 pl-10 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
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
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
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
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
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

      <div className="overflow-hidden rounded-xl border border-border bg-card/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  User
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Role
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Joined
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
                        <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t("admin.noUsers") || "No users found"}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border transition-colors hover:bg-card"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-medium text-foreground">
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          {user.username && (
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{user.phone}</td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">{getStatusBadge(user.status)}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu isLoading={isUpdating === user.id}>
                        <ActionMenuItem
                          onClick={() => handleViewUser(user)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View Profile
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

                        {user.role !== "moderator" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleRoleChange(user.id, "moderator")
                            }
                            icon={<Shield className="h-4 w-4" />}
                            variant="warning"
                          >
                            Make Moderator
                          </ActionMenuItem>
                        )}

                        {user.role !== "teacher" && (
                          <ActionMenuItem
                            onClick={() => handleRoleChange(user.id, "teacher")}
                            icon={<GraduationCap className="h-4 w-4" />}
                            variant="info"
                          >
                            Make Teacher
                          </ActionMenuItem>
                        )}

                        <ActionMenuDivider />

                        <ActionMenuItem
                          onClick={() => handleDelete(user.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="danger"
                        >
                          Delete User
                        </ActionMenuItem>
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} (
              {pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {t("blog.previous") || "Previous"}
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
              >
                {t("blog.next") || "Next"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedUser && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.userProfile") || "User Profile"}
              </h3>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditingUser(null);
                }}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xl font-medium text-foreground">
                  {selectedUser.firstName?.charAt(0)}
                  {selectedUser.lastName?.charAt(0)}
                </div>
                <div>
                  <p className="text-muted-foreground">ID: {selectedUser.id}</p>
                  <p className="text-muted-foreground">{selectedUser.phone}</p>
                  {selectedUser.username && (
                    <p className="text-muted-foreground">@{selectedUser.username}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("auth.firstName") || "First Name"}
                  </label>
                  <input
                    type="text"
                    value={editingUser.firstName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("auth.lastName") || "Last Name"}
                  </label>
                  <input
                    type="text"
                    value={editingUser.lastName}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("admin.role") || "Role"}
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="student">
                      {t("admin.student") || "Student"}
                    </option>
                    <option value="teacher">
                      {t("admin.teacher") || "Teacher"}
                    </option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("admin.status") || "Status"}
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pending">
                      {t("admin.pending") || "Pending"}
                    </option>
                    <option value="active">
                      {t("admin.active") || "Active"}
                    </option>
                    <option value="blocked">
                      {t("admin.suspended") || "Blocked"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {t("admin.joined") || "Joined"}:{" "}
                {new Date(selectedUser.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setEditingUser(null);
                }}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isUpdating === selectedUser.id}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
              >
                {isUpdating === selectedUser.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.save") || "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.addUser") || "Add New User"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    Telegram ID *
                  </label>
                  <input
                    type="text"
                    value={newUser.id}
                    onChange={(e) =>
                      setNewUser({ ...newUser, id: e.target.value })
                    }
                    placeholder="123456789"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("auth.phone") || "Phone"} *
                  </label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) =>
                      setNewUser({ ...newUser, phone: e.target.value })
                    }
                    placeholder="+998901234567"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("auth.firstName") || "First Name"} *
                  </label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("auth.lastName") || "Last Name"} *
                  </label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("admin.role") || "Role"}
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        role: e.target.value as typeof newUser.role,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="student">
                      {t("admin.student") || "Student"}
                    </option>
                    <option value="teacher">
                      {t("admin.teacher") || "Teacher"}
                    </option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm text-muted-foreground">
                    {t("admin.status") || "Status"}
                  </label>
                  <select
                    value={newUser.status}
                    onChange={(e) =>
                      setNewUser({
                        ...newUser,
                        status: e.target.value as typeof newUser.status,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                  >
                    <option value="active">
                      {t("admin.active") || "Active"}
                    </option>
                    <option value="pending">
                      {t("admin.pending") || "Pending"}
                    </option>
                    <option value="blocked">
                      {t("admin.suspended") || "Blocked"}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-muted-foreground">
                  Username
                </label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="johndoe"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                />
              </div>

              {newUser.role === "teacher" && (
                <>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={newUser.businessName}
                      onChange={(e) =>
                        setNewUser({ ...newUser, businessName: e.target.value })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-muted-foreground">
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={newUser.specialization}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          specialization: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleCreateUser}
                disabled={
                  isCreating ||
                  !newUser.id ||
                  !newUser.phone ||
                  !newUser.firstName ||
                  !newUser.lastName
                }
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
              >
                {isCreating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  t("admin.addUser") || "Add User"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardUsersPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Authorization check - only admin and moderator can access
  if (user && user.role !== "admin" && user.role !== "moderator") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-16 w-16 text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="mt-2 text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <DashboardUsersContent />;
}
