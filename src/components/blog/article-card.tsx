"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TransformedBlog } from "@/services/blog";

interface ArticleCardProps {
  article: TransformedBlog;
  index?: number;
  className?: string;
}

/**
 * Format number for display (e.g., 1500 -> 1.5k)
 */
function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function ArticleCard({
  article,
  index = 0,
  className,
}: ArticleCardProps) {
  const isFirstCard = index === 0;
  const isLastCard = index === 5;

  const cardContent = (
    <Card
      className={cn(
        "group relative h-full transition-all duration-300 hover:shadow-lg",
        "border-border/50 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/30 hover:bg-card/80",
        isFirstCard && "md:col-span-2 md:row-span-2",
        isLastCard && "md:col-span-2",
        article.isFallback && "opacity-80",
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            "group-hover:text-primary line-clamp-2 transition-colors",
            isFirstCard ? "text-xl md:text-2xl" : "text-lg"
          )}
        >
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className={cn(
            "text-muted-foreground",
            isFirstCard ? "line-clamp-4" : "line-clamp-2",
            "text-sm"
          )}
        >
          {article.description}
        </p>

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatNumber(article.views)}
            </span>
            <span>{article.date}</span>
          </div>
          {article.category && (
            <Badge variant="secondary" className="text-xs">
              {article.category}
            </Badge>
          )}
        </div>

        {article.isFallback && (
          <Badge variant="outline" className="text-xs text-yellow-600">
            Offline
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  // If fallback, don't make it a link
  if (article.isFallback) {
    return cardContent;
  }

  return (
    <Link href={`/blog/${article.slug || article.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
