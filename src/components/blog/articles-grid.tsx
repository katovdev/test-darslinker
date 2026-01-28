"use client";

import { useEffect, useState } from "react";
import { RefreshCw, FileText, Loader2 } from "lucide-react";
import { ArticleCard } from "./article-card";
import { blogService, type TransformedBlog } from "@/services/blog";
import { cn } from "@/lib/utils";

interface ArticlesGridProps {
  limit?: number;
  showLoadingState?: boolean;
  showErrorState?: boolean;
  className?: string;
}

export function ArticlesGrid({
  limit = 6,
  showLoadingState = true,
  showErrorState = true,
  className,
}: ArticlesGridProps) {
  const [articles, setArticles] = useState<TransformedBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArticles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await blogService.getFeaturedBlogsForLanding(limit);
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load articles");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [limit]);

  if (isLoading && showLoadingState) {
    return (
      <div
        className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
      >
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-border bg-card p-5"
          >
            <div className="mb-3 h-5 w-20 rounded-full bg-muted" />
            <div className="h-6 w-4/5 rounded bg-muted" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-full rounded bg-muted/50" />
              <div className="h-4 w-3/4 rounded bg-muted/50" />
            </div>
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-16 rounded bg-muted/50" />
              <div className="h-4 w-20 rounded bg-muted/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && articles.length === 0 && showErrorState) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-muted-foreground">{error}</p>
        <button
          onClick={loadArticles}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-secondary/80"
        >
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </button>
      </div>
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Hozircha maqolalar mavjud emas</p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
