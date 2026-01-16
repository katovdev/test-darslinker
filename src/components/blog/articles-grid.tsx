"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, BookOpen } from "lucide-react";
import { ArticleCard } from "./article-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Loading state
  if (isLoading && showLoadingState) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Maqolalar yuklanmoqda...</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => (
            <ArticleCardSkeleton key={i} isLarge={i === 0} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && articles.length === 0 && showErrorState) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 text-center",
          className
        )}
      >
        <div className="rounded-full bg-destructive/10 p-4">
          <BookOpen className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Maqolalarni yuklashda xatolik</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
        <Button onClick={loadArticles} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </Button>
      </div>
    );
  }

  // Empty state
  if (!isLoading && articles.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 py-12 text-center",
          className
        )}
      >
        <div className="rounded-full bg-muted p-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Hozircha maqolalar mavjud emas</h3>
          <p className="text-sm text-muted-foreground">
            Tez orada yangi va qiziqarli maqolalar qo&apos;shiladi
          </p>
        </div>
        <Button onClick={loadArticles} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Sahifani yangilash
        </Button>
      </div>
    );
  }

  // Articles grid
  return (
    <div
      className={cn(
        "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
        // First card spans 2 columns on larger screens
        "[&>*:first-child]:md:col-span-2 [&>*:first-child]:md:row-span-2",
        className
      )}
    >
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton for article card loading state
 */
function ArticleCardSkeleton({ isLarge = false }: { isLarge?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 space-y-4",
        isLarge && "md:col-span-2 md:row-span-2"
      )}
    >
      <Skeleton className={cn("h-6", isLarge ? "w-3/4" : "w-2/3")} />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        {isLarge && <Skeleton className="h-4 w-4/5" />}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
