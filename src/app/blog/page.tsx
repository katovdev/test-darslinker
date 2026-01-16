"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Loader2, RefreshCw, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleCard } from "@/components/blog/article-card";
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
          // Transform blogs for display
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

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages: (number | string)[] = [];
    const { page, totalPages } = pagination;

    // Always show first page
    pages.push(1);

    // Show ellipsis or pages near current
    if (page > 3) {
      pages.push("...");
    }

    // Pages around current
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    // Show ellipsis before last
    if (page < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return (
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
          className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
        >
          {t("blog.previous")}
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((p, idx) =>
            typeof p === "number" ? (
              <Button
                key={idx}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(p)}
                className={
                  p === page
                    ? "bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
                    : "border-gray-700 bg-transparent text-white hover:bg-gray-800"
                }
              >
                {p}
              </Button>
            ) : (
              <span key={idx} className="px-2 text-gray-500">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === pagination.totalPages}
          className="border-gray-700 bg-transparent text-white hover:bg-gray-800"
        >
          {t("blog.next")}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("blog.backToHome")}
              </Link>
            </Button>
          </div>
          <h1 className="text-xl font-bold text-white">{t("blog.title")}</h1>
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder={t("blog.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
            >
              {t("blog.search")}
            </Button>
          </form>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full border-gray-700 bg-gray-800 text-white sm:w-48">
              <SelectValue placeholder={t("blog.allCategories")} />
            </SelectTrigger>
            <SelectContent className="border-gray-700 bg-gray-800">
              <SelectItem value="all" className="text-white hover:bg-gray-700">
                {t("blog.allCategories")}
              </SelectItem>
              {categories.map((cat) => (
                <SelectItem
                  key={cat.id}
                  value={cat.id}
                  className="text-white hover:bg-gray-700"
                >
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        {!isLoading && !error && (
          <p className="mb-6 text-sm text-gray-400">
            {t("blog.showingResults", {
              count: blogs.length.toString(),
              total: pagination.total.toString(),
            })}
          </p>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{t("blog.loading")}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="space-y-4 rounded-lg border border-gray-800 bg-gray-800/30 p-4"
                >
                  <Skeleton className="h-6 w-3/4 bg-gray-700" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full bg-gray-700" />
                    <Skeleton className="h-4 w-5/6 bg-gray-700" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 bg-gray-700" />
                    <Skeleton className="h-5 w-16 rounded-full bg-gray-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <Button
              onClick={() => loadBlogs(pagination.page)}
              variant="outline"
              className="gap-2 border-gray-700 text-white hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
              {t("blog.retry")}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && blogs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="rounded-full bg-gray-800 p-4">
              <BookOpen className="h-8 w-8 text-gray-500" />
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
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                variant="outline"
                className="gap-2 border-gray-700 text-white hover:bg-gray-800"
              >
                {t("blog.clearFilters")}
              </Button>
            )}
          </div>
        )}

        {/* Blog Grid */}
        {!isLoading && !error && blogs.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <ArticleCard key={blog.id} article={blog} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {renderPagination()}
          </>
        )}
      </main>
    </div>
  );
}
