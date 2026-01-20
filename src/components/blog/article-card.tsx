"use client";

import Link from "next/link";
import { Eye, Calendar, Tag } from "lucide-react";
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
    <article className="group h-full rounded-2xl border border-gray-700 bg-gray-800/30 p-5 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50">
      {/* Category badge */}
      {article.category && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <Tag className="h-3 w-3" />
          {article.category}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-blue-400">
        {article.title}
      </h3>

      {/* Description */}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">
        {article.description}
      </p>

      {/* Meta info */}
      <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5" />
          {formatNumber(article.views)}
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
