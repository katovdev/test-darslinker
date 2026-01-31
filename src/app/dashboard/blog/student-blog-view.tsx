"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ArticleCard } from "@/components/blog/article-card";
import { useTranslations } from "@/hooks/use-locale";
import { blogService, type TransformedBlog } from "@/services/blog";
import type { BlogCategory } from "@/lib/api/blog";

const BLOGS_PER_PAGE = 12;

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
}

export function StudentBlogView() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<TransformedBlog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const loadBlogs = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);
      setError(null);

      try {
        const params: {
          page: number;
          limit: number;
          search?: string;
          categoryId?: string;
        } = {
          page,
          limit: BLOGS_PER_PAGE,
        };

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (selectedCategory !== "all") {
          params.categoryId = selectedCategory;
        }

        const response = await blogService.getAllBlogs(params);

        if (response?.data) {
          setBlogs(response.data || []);
          if (response.pagination) {
            setPagination(response.pagination);
          }
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
        setError(t("blog.loadError") || "Failed to load blogs");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, selectedCategory]
  );

  useEffect(() => {
    loadBlogs(1);
  }, [loadBlogs]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await blogService.getCategories();
        if (response?.data) {
          setCategories(response.data || []);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    loadCategories();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBlogs(1);
  };

  const handlePageChange = (newPage: number) => {
    loadBlogs(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {t("blog.title") || "Blog"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t("blog.subtitle") || "Read articles and learning tips"}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("blog.search") || "Search articles..."}
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
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPagination((prev) => ({ ...prev, page: 1 }));
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

          <button
            onClick={() => loadBlogs(pagination.page)}
            disabled={isLoading}
            className="rounded-lg border border-border bg-secondary px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            title={t("common.refresh") || "Refresh"}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
            <p className="mt-2 text-sm text-muted-foreground">
              {t("blog.loading") || "Loading articles..."}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-lg border border-red-900/50 bg-red-900/10 p-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && blogs.length === 0 && (
        <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-border bg-card/50 p-12">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {t("blog.noBlogs") || "No articles found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery || selectedCategory !== "all"
                ? t("blog.tryDifferentSearch") || "Try adjusting your filters"
                : t("blog.checkBackLater") ||
                  "Check back later for new articles"}
            </p>
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && !error && blogs.length > 0 && (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <ArticleCard key={blog.id} article={blog} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-6">
              <p className="text-sm text-muted-foreground">
                {(
                  t("blog.showingResults") ||
                  "Showing {count} of {total} articles"
                )
                  .replace("{count}", String(blogs.length))
                  .replace("{total}", String(pagination.total))}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("blog.previous") || "Previous"}
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-1 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm text-foreground disabled:opacity-50"
                >
                  {t("blog.next") || "Next"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
