"use client";

import Link from "next/link";
import { Heart, Calendar, Tag } from "lucide-react";
import type { TransformedBlog } from "@/services/blog";

interface ArticleCardProps {
  article: TransformedBlog;
  darkMode?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

export function ArticleCard({ article, darkMode = false }: ArticleCardProps) {
  const content = (
    <article
      className={`group h-full rounded-2xl border p-5 transition-all duration-300 ${
        darkMode
          ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
          : "border-border bg-card hover:border-primary/50 hover:shadow-lg"
      }`}
    >
      {article.category && (
        <div
          className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            darkMode
              ? "bg-green-500/20 text-green-400"
              : "bg-blue-500/10 text-blue-500"
          }`}
        >
          <Tag className="h-3 w-3" />
          {article.category}
        </div>
      )}

      <h3
        className={`text-lg font-semibold transition-colors ${
          darkMode
            ? "text-white group-hover:text-green-400"
            : "text-foreground group-hover:text-primary"
        }`}
      >
        {article.title}
      </h3>

      <p
        className={`mt-2 line-clamp-2 text-sm leading-relaxed ${
          darkMode ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        {article.description}
      </p>

      <div
        className={`mt-4 flex items-center gap-4 text-xs ${
          darkMode ? "text-white/60" : "text-muted-foreground"
        }`}
      >
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
