"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Loader2,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ArticleCard } from "@/components/blog/article-card";
import { HomeHeader, HomeFooter } from "@/components/home";
import { useTranslations } from "@/hooks/use-locale";
import { blogService, type TransformedBlog } from "@/services/blog";
import { blogAPI, type Category } from "@/lib/api/blog";

const BLOGS_PER_PAGE = 12;

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
}

export default function BlogPage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<TransformedBlog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
          category?: string;
        } = {
          page,
          limit: BLOGS_PER_PAGE,
        };

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (selectedCategory && selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        const response = await blogService.getAllBlogs(params);

        if (response.success && response.data) {
          const transformedBlogs: TransformedBlog[] = response.data.map(
            (blog) => ({
              id: blog.id || blog._id || "",
              title: blog.title,
              description: blog.subtitle || "",
              views: blog.multiViews || 0,
              date: new Date(blog.createdAt).toLocaleDateString("uz-UZ"),
              category: blog.categoryId?.name || null,
              slug: blog.slug || blog.id || blog._id || "",
              tags: blog.tags || [],
              isArchived: blog.isArchive || false,
            })
          );

          setBlogs(transformedBlogs);

          if (response.pagination) {
            setPagination({
              page: response.pagination.page,
              totalPages: response.pagination.totalPages,
              total: response.pagination.total,
            });
          }
        }
      } catch (err) {
        setError(t("blog.loadError"));
        console.error("Failed to load blogs:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedCategory, t]
  );

  const loadCategories = async () => {
    try {
      const response = await blogAPI.getCategories(true);
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadBlogs(1);
  }, [selectedCategory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBlogs(1);
  };

  const handlePageChange = (newPage: number) => {
    loadBlogs(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      {/* Hero Section */}
      <section className="relative px-4 py-16 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-green-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-block rounded-full bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
            {t("home.articlesLabel") || "Blog"}
          </span>
          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            {t("blog.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {t("home.articlesSubtitle")}
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="border-t border-gray-800 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row">
            <form onSubmit={handleSearch} className="flex flex-1 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder={t("blog.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-700 bg-gray-800/50 py-3 pl-12 pr-4 text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                {t("blog.search")}
              </button>
            </form>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-3 text-white outline-none transition-colors focus:border-blue-500 sm:w-48"
            >
              <option value="all">{t("blog.allCategories")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results Info */}
          {!isLoading && !error && (
            <p className="mt-6 text-sm text-gray-500">
              {t("blog.showingResults", {
                count: blogs.length.toString(),
                total: pagination.total.toString(),
              })}
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <main className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Loading State */}
          {isLoading && (
            <div className="space-y-8">
              <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("blog.loading")}</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-gray-700 bg-gray-800/30 p-5"
                  >
                    <div className="mb-3 h-5 w-20 rounded-full bg-gray-700" />
                    <div className="h-6 w-4/5 rounded bg-gray-700" />
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-full rounded bg-gray-700/50" />
                      <div className="h-4 w-3/4 rounded bg-gray-700/50" />
                    </div>
                    <div className="mt-4 flex gap-4">
                      <div className="h-4 w-16 rounded bg-gray-700/50" />
                      <div className="h-4 w-20 rounded bg-gray-700/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {t("blog.errorTitle")}
                </h3>
                <p className="text-sm text-gray-400">{error}</p>
              </div>
              <button
                onClick={() => loadBlogs(pagination.page)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                {t("blog.retry")}
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && blogs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800">
                <FileText className="h-8 w-8 text-gray-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {t("blog.noResults")}
                </h3>
                <p className="text-sm text-gray-400">
                  {t("blog.tryDifferentSearch")}
                </p>
              </div>
              {(searchQuery || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
                >
                  {t("blog.clearFilters")}
                </button>
              )}
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
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t("blog.previous")}
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        const current = pagination.page;
                        return (
                          p === 1 ||
                          p === pagination.totalPages ||
                          (p >= current - 1 && p <= current + 1)
                        );
                      })
                      .map((p, idx, arr) => (
                        <span key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="px-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(p)}
                            className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                              p === pagination.page
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "border border-gray-700 bg-gray-800/50 text-white hover:border-gray-600 hover:bg-gray-800"
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t("blog.next")}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
