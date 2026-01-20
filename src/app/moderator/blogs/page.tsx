"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Trash2,
  Plus,
  X,
  Heart,
  Send,
  Save,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { adminBlogApi, type Blog, type BlogCategory } from "@/lib/api/blog";
import { toast } from "sonner";

type StatusFilter = "all" | "draft" | "published" | "archived";

interface BlogFormData {
  title: string;
  subtitle: string;
  content: string;
  categoryId: string;
  status: "draft" | "published";
  thumbnail: string;
}

const initialFormData: BlogFormData = {
  title: "",
  subtitle: "",
  content: "",
  categoryId: "",
  status: "draft",
  thumbnail: "",
};

export default function ModeratorBlogsPage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );

  const loadBlogs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminBlogApi.getBlogs({
        page,
        limit: 20,
        search: search || undefined,
        categoryId: categoryFilter === "all" ? undefined : categoryFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (response?.success && response.data) {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
      } else {
        setError(t("moderator.statsLoadError") || "Failed to load blogs");
      }
    } catch {
      setError(t("moderator.statsLoadError") || "Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminBlogApi.getCategories({ activeOnly: false });
      if (response?.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch {}
  };

  useEffect(() => {
    loadBlogs();
  }, [page, categoryFilter, statusFilter]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBlogs();
  };

  const handleOpenActionMenu = (
    blogId: string,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (actionMenuId === blogId) {
      setActionMenuId(null);
      setActionMenuPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setActionMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 192,
      });
      setActionMenuId(blogId);
    }
  };

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setActionMenuId(null);
    setActionMenuPosition(null);
  };

  const handleOpenCreateModal = () => {
    setEditingBlog(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      subtitle: blog.subtitle || "",
      content: blog.content || "",
      categoryId: blog.category?.id || "",
      status: blog.status === "archived" ? "draft" : blog.status,
      thumbnail: blog.thumbnail || "",
    });
    setIsModalOpen(true);
    setActionMenuId(null);
    setActionMenuPosition(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBlog(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (field: keyof BlogFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSavingCategory(true);

    try {
      const response = await adminBlogApi.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });

      if (response?.success) {
        toast.success("Category created successfully");
        setNewCategoryName("");
        setNewCategoryDescription("");
        loadCategories();
      } else {
        toast.error("Failed to create category");
      }
    } catch {
      toast.error("Failed to create category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    setDeletingCategoryId(categoryId);

    try {
      const response = await adminBlogApi.deleteCategory(categoryId);

      if (response?.success) {
        toast.success("Category deleted successfully");
        loadCategories();
      } else {
        toast.error("Failed to delete category");
      }
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleSaveBlog = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        content: formData.content,
        categoryId: formData.categoryId || undefined,
        status: formData.status,
        thumbnail: formData.thumbnail.trim() || undefined,
      };

      let response;
      if (editingBlog) {
        response = await adminBlogApi.updateBlog(editingBlog.id, {
          ...payload,
          subtitle: payload.subtitle || null,
          categoryId: payload.categoryId || null,
          thumbnail: payload.thumbnail || null,
        });
      } else {
        response = await adminBlogApi.createBlog(payload);
      }

      if (response?.success) {
        toast.success(
          editingBlog
            ? "Blog updated successfully"
            : "Blog created successfully"
        );
        handleCloseModal();
        loadBlogs();
      } else {
        toast.error(
          editingBlog ? "Failed to update blog" : "Failed to create blog"
        );
      }
    } catch {
      toast.error(
        editingBlog ? "Failed to update blog" : "Failed to create blog"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (
    blogId: string,
    status: "draft" | "published" | "archived"
  ) => {
    setIsUpdating(blogId);
    setActionMenuId(null);
    setActionMenuPosition(null);

    try {
      const response = await adminBlogApi.updateBlog(blogId, { status });

      if (response?.success) {
        toast.success(
          `Blog ${status === "published" ? "published" : status === "archived" ? "archived" : "set to draft"}`
        );
        loadBlogs();
      } else {
        toast.error("Failed to update blog status");
      }
    } catch {
      toast.error("Failed to update blog status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (blogId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this blog? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsUpdating(blogId);
    setActionMenuId(null);
    setActionMenuPosition(null);

    try {
      const response = await adminBlogApi.deleteBlog(blogId);

      if (response?.success) {
        toast.success("Blog deleted successfully");
        loadBlogs();
      } else {
        toast.error("Failed to delete blog");
      }
    } catch {
      toast.error("Failed to delete blog");
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: Blog["status"]) => {
    switch (status) {
      case "published":
        return (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
            Published
          </span>
        );
      case "archived":
        return (
          <span className="rounded-full bg-gray-500/10 px-2 py-0.5 text-xs font-medium text-gray-400">
            Archived
          </span>
        );
      case "draft":
      default:
        return (
          <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
            Draft
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {t("moderator.blogs") || "Blogs"}
          </h1>
          <p className="mt-1 text-gray-400">
            {t("moderator.blogsSubtitle") || "Manage blog posts"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBlogs}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh") || "Refresh"}
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Archive className="h-4 w-4" />
            Categories
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" />
            {t("moderator.createBlog") || "Create Blog"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("blog.search") || "Search blogs..."}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2 pr-4 pl-10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {t("blog.search") || "Search"}
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">
              {t("blog.allCategories") || "All Categories"}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">
              {t("moderator.allStatuses") || "All Statuses"}
            </option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
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
                  Title
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Likes
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400">
                  Created
                </th>
                <th className="px-4 py-3 text-sm font-medium text-gray-400"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-800">
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-700" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-600" />
                    <p className="mt-2 text-gray-400">
                      {t("blog.noBlogs") || "No blogs found"}
                    </p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-gray-800 transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{blog.title}</p>
                        {blog.subtitle && (
                          <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                            {blog.subtitle}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {blog.category ? (
                        <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                          {blog.category.name}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-300">
                        <Heart className="h-3.5 w-3.5" />
                        {blog.likesCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => handleOpenActionMenu(blog.id, e)}
                        disabled={isUpdating === blog.id}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50"
                      >
                        {isUpdating === blog.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </button>
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
              {pagination.total} blogs)
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

      {/* Action Menu - Fixed Position */}
      {actionMenuId && actionMenuPosition && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setActionMenuId(null);
              setActionMenuPosition(null);
            }}
          />
          <div
            className="fixed z-50 w-48 rounded-lg border border-gray-700 bg-gray-800 py-1 shadow-xl"
            style={{
              top: actionMenuPosition.top,
              left: Math.max(8, actionMenuPosition.left),
            }}
          >
            {(() => {
              const blog = blogs.find((b) => b.id === actionMenuId);
              if (!blog) return null;
              return (
                <>
                  <button
                    onClick={() => handleViewBlog(blog)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>

                  {blog.status === "published" && (
                    <a
                      href={`/blog/${blog.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                      View on Site
                    </a>
                  )}

                  <button
                    onClick={() => handleOpenEditModal(blog)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Blog
                  </button>

                  <div className="my-1 border-t border-gray-700" />

                  {blog.status === "draft" && (
                    <button
                      onClick={() => handleUpdateStatus(blog.id, "published")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-700"
                    >
                      <Send className="h-4 w-4" />
                      Publish
                    </button>
                  )}

                  {blog.status === "published" && (
                    <button
                      onClick={() => handleUpdateStatus(blog.id, "draft")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                      Unpublish (Draft)
                    </button>
                  )}

                  {blog.status !== "archived" && (
                    <button
                      onClick={() => handleUpdateStatus(blog.id, "archived")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-yellow-400 hover:bg-gray-700"
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}

                  {blog.status === "archived" && (
                    <button
                      onClick={() => handleUpdateStatus(blog.id, "draft")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-gray-700"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Restore to Draft
                    </button>
                  )}

                  <div className="my-1 border-t border-gray-700" />

                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Blog
                  </button>
                </>
              );
            })()}
          </div>
        </>
      )}

      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {t("moderator.blogDetails") || "Blog Details"}
              </h3>
              <button
                onClick={() => setSelectedBlog(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedBlog.title}
                </h2>
                {selectedBlog.subtitle && (
                  <p className="mt-1 text-gray-400">{selectedBlog.subtitle}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {getStatusBadge(selectedBlog.status)}
                {selectedBlog.category && (
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400">
                    {selectedBlog.category.name}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-900 p-4">
                <div>
                  <p className="text-sm text-gray-500">Likes</p>
                  <p className="flex items-center gap-1 text-lg font-semibold text-white">
                    <Heart className="h-4 w-4" />
                    {selectedBlog.likesCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-white">
                    {formatDate(selectedBlog.createdAt)}
                  </p>
                </div>
                {selectedBlog.publishedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Published</p>
                    <p className="text-white">
                      {formatDate(selectedBlog.publishedAt)}
                    </p>
                  </div>
                )}
                {selectedBlog.slug && (
                  <div>
                    <p className="text-sm text-gray-500">Slug</p>
                    <p className="text-white">{selectedBlog.slug}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="text-white">
                  {selectedBlog.author.firstName} {selectedBlog.author.lastName}
                </p>
              </div>

              {selectedBlog.content && (
                <div>
                  <p className="mb-2 text-sm text-gray-500">Content Preview</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-900 p-4">
                    <div
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedBlog.content.substring(0, 500) + "...",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBlog(null)}
                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                {t("common.close") || "Close"}
              </button>
              {selectedBlog.status === "published" && (
                <a
                  href={`/blog/${selectedBlog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View on Site
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Blog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingBlog
                  ? "Edit Blog"
                  : t("moderator.createBlog") || "Create Blog"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Enter blog title..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleFormChange("subtitle", e.target.value)}
                  placeholder="Enter subtitle (optional)..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              {/* Category and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleFormChange("categoryId", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    disabled={isSaving}
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleFormChange(
                        "status",
                        e.target.value as "draft" | "published"
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                    disabled={isSaving}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    handleFormChange("thumbnail", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                  placeholder="Write your blog content here... (HTML supported)"
                  rows={12}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
                <p className="mt-1 text-xs text-gray-500">
                  HTML tags are supported for formatting.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleSaveBlog}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {editingBlog ? "Update Blog" : "Create Blog"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Manage Categories
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Create New Category */}
            <div className="mt-6 space-y-3 rounded-lg bg-gray-900 p-4">
              <h4 className="text-sm font-medium text-gray-300">
                Create New Category
              </h4>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                disabled={isSavingCategory}
              />
              <input
                type="text"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                disabled={isSavingCategory}
              />
              <button
                onClick={handleCreateCategory}
                disabled={isSavingCategory || !newCategoryName.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSavingCategory ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Category
                  </>
                )}
              </button>
            </div>

            {/* Existing Categories */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-gray-300">
                Existing Categories ({categories.length})
              </h4>
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500">No categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg bg-gray-900 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-600">
                          {category.blogsCount || 0} blogs
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategoryId === category.id}
                        className="rounded-lg p-2 text-red-400 hover:bg-gray-800 disabled:opacity-50"
                      >
                        {deletingCategoryId === category.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
              >
                {t("common.close") || "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
