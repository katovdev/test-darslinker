"use client";

import Link from "next/link";
import { Heart, Calendar, Tag } from "lucide-react";
import type { TransformedBlog } from "@/services/blog";

interface ArticleCardProps {
  article: TransformedBlog;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function ArticleCard({ article }: ArticleCardProps) {
  const content = (
    <article className="group h-full rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      {article.category && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500">
          <Tag className="h-3 w-3" />
          {article.category}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {article.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {article.description}
      </p>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Heart
            className={`h-3.5 w-3.5 ${article.isLiked ? "fill-red-500 text-red-500" : ""}`}
          />
          {formatNumber(article.likesCount)}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {article.date}
        </span>
      </div>
    </article>
  );

  if (article.isFallback) {
    return content;
  }

  return (
    <Link href={`/blog/${article.slug || article.id}`} className="block h-full">
      {content}
    </Link>
  );
}
