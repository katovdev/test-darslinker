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
  darkMode?: boolean;
}

export function ArticlesGrid({
  limit = 6,
  showLoadingState = true,
  showErrorState = true,
  className,
  darkMode = false,
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
            className={`animate-pulse rounded-2xl border p-5 ${
              darkMode
                ? "border-white/10"
                : "border-border bg-card"
            }`}
            style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.025)" } : undefined}
          >
            <div
              className={`mb-3 h-5 w-20 rounded-full ${darkMode ? "" : "bg-muted"}`}
              style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.05)" } : undefined}
            />
            <div
              className={`h-6 w-4/5 rounded ${darkMode ? "" : "bg-muted"}`}
              style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.05)" } : undefined}
            />
            <div className="mt-3 space-y-2">
              <div
                className={`h-4 w-full rounded ${darkMode ? "" : "bg-muted/50"}`}
                style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.025)" } : undefined}
              />
              <div
                className={`h-4 w-3/4 rounded ${darkMode ? "" : "bg-muted/50"}`}
                style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.025)" } : undefined}
              />
            </div>
            <div className="mt-4 flex gap-4">
              <div
                className={`h-4 w-16 rounded ${darkMode ? "" : "bg-muted/50"}`}
                style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.025)" } : undefined}
              />
              <div
                className={`h-4 w-20 rounded ${darkMode ? "" : "bg-muted/50"}`}
                style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.025)" } : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error && articles.length === 0 && showErrorState) {
    return (
      <div className={cn("py-16 text-center", className)}>
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${darkMode ? "bg-red-500/10" : "bg-red-500/10"}`}
        >
          <FileText className="h-8 w-8 text-red-500" />
        </div>
        <p className={darkMode ? "text-white/70" : "text-muted-foreground"}>
          {error}
        </p>
        <button
          onClick={loadArticles}
          className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            darkMode
              ? "border-white/20 text-white hover:border-white/30"
              : "border-border bg-secondary text-foreground hover:border-primary hover:bg-secondary/80"
          }`}
          style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.05)" } : undefined}
          onMouseEnter={darkMode ? (e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
          } : undefined}
          onMouseLeave={darkMode ? (e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
          } : undefined}
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
        <div
          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${darkMode ? "" : "bg-muted"}`}
          style={darkMode ? { backgroundColor: "rgba(255, 255, 255, 0.05)" } : undefined}
        >
          <FileText
            className={`h-8 w-8 ${darkMode ? "text-white/50" : "text-muted-foreground"}`}
          />
        </div>
        <p className={darkMode ? "text-white/70" : "text-muted-foreground"}>
          Hozircha maqolalar mavjud emas
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} darkMode={darkMode} />
      ))}
    </div>
  );
}
