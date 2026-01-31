"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
import {
  ActionMenu,
  ActionMenuItem,
  ActionMenuDivider,
} from "@/components/ui/action-menu";
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

export default function AdminBlogsPage() {
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

  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  // Create/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [formData, setFormData] = useState<BlogFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Category modal state
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
        setError(t("admin.statsLoadError") || "Failed to load blogs");
      }
    } catch {
      setError(t("admin.statsLoadError") || "Failed to load blogs");
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
    } catch {
      // Silent fail for categories
    }
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

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
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
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
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
          <h1 className="text-2xl font-bold text-foreground">
            {t("admin.blogs") || "Blogs"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("admin.blogsSubtitle") || "Manage blog posts"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadBlogs}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {t("common.refresh") || "Refresh"}
          </button>
          <button
            className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-border hover:bg-secondary"
            onClick={() => setIsCategoryModalOpen(true)}
          >
            <Archive className="h-4 w-4" />
            Categories
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-blue-700"
            onClick={handleOpenCreateModal}
          >
            <Plus className="h-4 w-4" />
            {t("admin.createBlog") || "Create Blog"}
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
              placeholder={t("blog.search") || "Search blogs..."}
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
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
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
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-blue-500 focus:outline-none"
          >
            <option value="all">
              {t("admin.allStatuses") || "All Statuses"}
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Category
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Likes
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-sm font-medium text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3">
                      <div className="h-4 w-48 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-16 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-secondary" />
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                ))
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {t("blog.noBlogs") || "No blogs found"}
                    </p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr
                    key={blog.id}
                    className="border-b border-border transition-colors hover:bg-secondary"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{blog.title}</p>
                        {blog.subtitle && (
                          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
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
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(blog.status)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-foreground">
                        <Heart className="h-3.5 w-3.5" />
                        {blog.likesCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(blog.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <ActionMenu isLoading={isUpdating === blog.id}>
                        <ActionMenuItem
                          onClick={() => handleViewBlog(blog)}
                          icon={<Eye className="h-4 w-4" />}
                        >
                          View Details
                        </ActionMenuItem>

                        {blog.status === "published" && (
                          <ActionMenuItem
                            href={`/blog/${blog.slug}`}
                            icon={<Eye className="h-4 w-4" />}
                            external
                          >
                            View on Site
                          </ActionMenuItem>
                        )}

                        <ActionMenuItem
                          onClick={() => handleOpenEditModal(blog)}
                          icon={<Edit className="h-4 w-4" />}
                          variant="info"
                        >
                          Edit Blog
                        </ActionMenuItem>

                        <ActionMenuDivider />

                        {blog.status === "draft" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleUpdateStatus(blog.id, "published")
                            }
                            icon={<Send className="h-4 w-4" />}
                            variant="success"
                          >
                            Publish
                          </ActionMenuItem>
                        )}

                        {blog.status === "published" && (
                          <ActionMenuItem
                            onClick={() => handleUpdateStatus(blog.id, "draft")}
                            icon={<Edit className="h-4 w-4" />}
                            variant="warning"
                          >
                            Unpublish (Draft)
                          </ActionMenuItem>
                        )}

                        {blog.status !== "archived" && (
                          <ActionMenuItem
                            onClick={() =>
                              handleUpdateStatus(blog.id, "archived")
                            }
                            icon={<Archive className="h-4 w-4" />}
                            variant="warning"
                          >
                            Archive
                          </ActionMenuItem>
                        )}

                        {blog.status === "archived" && (
                          <ActionMenuItem
                            onClick={() => handleUpdateStatus(blog.id, "draft")}
                            icon={<RefreshCw className="h-4 w-4" />}
                            variant="success"
                          >
                            Restore to Draft
                          </ActionMenuItem>
                        )}

                        <ActionMenuDivider />

                        <ActionMenuItem
                          onClick={() => handleDelete(blog.id)}
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="danger"
                        >
                          Delete Blog
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
              {pagination.total} blogs)
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

      {selectedBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {t("admin.blogDetails") || "Blog Details"}
              </h3>
              <button
                onClick={() => setSelectedBlog(null)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {selectedBlog.title}
                </h2>
                {selectedBlog.subtitle && (
                  <p className="mt-1 text-muted-foreground">{selectedBlog.subtitle}</p>
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

              <div className="grid grid-cols-2 gap-4 rounded-lg bg-background p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Likes</p>
                  <p className="flex items-center gap-1 text-lg font-semibold text-foreground">
                    <Heart className="h-4 w-4" />
                    {selectedBlog.likesCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-foreground">
                    {formatDate(selectedBlog.createdAt)}
                  </p>
                </div>
                {selectedBlog.publishedAt && (
                  <div>
                    <p className="text-sm text-muted-foreground">Published</p>
                    <p className="text-foreground">
                      {formatDate(selectedBlog.publishedAt)}
                    </p>
                  </div>
                )}
                {selectedBlog.slug && (
                  <div>
                    <p className="text-sm text-muted-foreground">Slug</p>
                    <p className="text-foreground">{selectedBlog.slug}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <p className="text-foreground">
                  {selectedBlog.author.firstName} {selectedBlog.author.lastName}
                </p>
              </div>

              {selectedBlog.content && (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Content Preview</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-background p-4">
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
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t("common.close") || "Close"}
              </button>
              {selectedBlog.status === "published" && (
                <a
                  href={`/blog/${selectedBlog.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700"
                >
                  View on Site
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                {editingBlog
                  ? "Edit Blog"
                  : t("admin.createBlog") || "Create Blog"}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="Enter blog title..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleFormChange("subtitle", e.target.value)}
                  placeholder="Enter subtitle (optional)..."
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Category
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      handleFormChange("categoryId", e.target.value)
                    }
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none"
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
                  <label className="mb-1 block text-sm font-medium text-foreground">
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
                    className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:border-blue-500 focus:outline-none"
                    disabled={isSaving}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Thumbnail URL
                </label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) =>
                    handleFormChange("thumbnail", e.target.value)
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleFormChange("content", e.target.value)}
                  placeholder="Write your blog content here... (HTML supported)"
                  rows={12}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                  disabled={isSaving}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  HTML tags are supported for formatting.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
              >
                {t("common.cancel") || "Cancel"}
              </button>
              <button
                onClick={handleSaveBlog}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
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

      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-secondary p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">
                Manage Categories
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3 rounded-lg bg-background p-4">
              <h4 className="text-sm font-medium text-foreground">
                Create New Category
              </h4>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                disabled={isSavingCategory}
              />
              <input
                type="text"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none"
                disabled={isSavingCategory}
              />
              <button
                onClick={handleCreateCategory}
                disabled={isSavingCategory || !newCategoryName.trim()}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-foreground hover:bg-blue-700 disabled:opacity-50"
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

            <div className="mt-6">
              <h4 className="mb-3 text-sm font-medium text-foreground">
                Existing Categories ({categories.length})
              </h4>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between rounded-lg bg-background px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {category.blogsCount || 0} blogs
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={deletingCategoryId === category.id}
                        className="rounded-lg p-2 text-red-400 hover:bg-secondary disabled:opacity-50"
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
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
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
