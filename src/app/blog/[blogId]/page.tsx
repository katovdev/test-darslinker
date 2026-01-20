"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  Calendar,
  Share2,
  RefreshCw,
  FileText,
  Check,
  Tag,
  Loader2,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { blogService, type TransformedBlog } from "@/services/blog";
import { toast } from "sonner";
import { HomeHeader, HomeFooter } from "@/components/home";
import { useAuth } from "@/context/auth-context";

export default function BlogDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const blogSlug = params.blogId as string;

  const [blog, setBlog] = useState<
    (TransformedBlog & { content?: string }) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    async function loadBlog() {
      if (!blogSlug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await blogService.getBlogBySlug(blogSlug);

        if (response.success && response.data) {
          setBlog(response.data);
        } else {
          setError(t("blog.notFound"));
        }
      } catch (err) {
        console.error("Failed to load blog:", err);
        setError(t("blog.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    loadBlog();
  }, [blogSlug, t]);

  const handleLike = async () => {
    if (!blog) return;

    if (!isAuthenticated) {
      toast.error(t("blog.loginToLike") || "Please login to like this article");
      return;
    }

    setIsLiking(true);
    try {
      const response = await blogService.toggleLike(blog.id);

      if (response.success) {
        setBlog((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            isLiked: response.liked,
            likesCount: response.likesCount ?? prev.likesCount,
          };
        });

        if (response.liked) {
          toast.success(t("blog.liked") || "Article liked!");
        }
      } else {
        toast.error(t("blog.likeFailed") || "Failed to like article");
      }
    } catch {
      toast.error(t("blog.likeFailed") || "Failed to like article");
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = blog?.title || "Blog";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success(t("blog.linkCopied"));
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error(t("blog.copyFailed"));
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <HomeHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-20 rounded-full bg-gray-700" />
            <div className="h-10 w-3/4 rounded bg-gray-700" />
            <div className="flex gap-4">
              <div className="h-5 w-24 rounded bg-gray-700" />
              <div className="h-5 w-24 rounded bg-gray-700" />
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-gray-700/50" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <HomeHeader />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <FileText className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className="h-4 w-4" />
                {t("blog.retry")}
              </button>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/25"
              >
                {t("blog.backToBlogs")}
              </Link>
            </div>
          </div>
        </main>
        <HomeFooter />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <HomeHeader />

      {/* Article Header */}
      <header className="relative border-b border-gray-800 px-4 py-12 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blog.backToBlogs")}
          </Link>

          {/* Category badge */}
          {blog.category && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
              <Tag className="h-3.5 w-3.5" />
              {blog.category}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(blog.date)}
            </span>

            {/* Like button */}
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 transition-colors ${
                blog.isLiked ? "text-red-500" : "hover:text-red-400"
              }`}
            >
              {isLiking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${blog.isLiked ? "fill-current" : ""}`}
                />
              )}
              {blog.likesCount} {t("blog.likes") || "likes"}
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copied ? t("blog.linkCopied") : t("blog.share") || "Share"}
            </button>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl">
          {/* Subtitle */}
          {blog.description && (
            <p className="mb-8 text-xl leading-relaxed text-gray-400">
              {blog.description}
            </p>
          )}

          {/* Content */}
          {blog.content ? (
            <div
              className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-blue-300"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-gray-400">{t("blog.noContent")}</p>
          )}
        </article>

        {/* Floating like button */}
        <div className="fixed right-6 bottom-6 z-50">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all ${
              blog.isLiked
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-red-400"
            }`}
          >
            {isLiking ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Heart
                className={`h-6 w-6 ${blog.isLiked ? "fill-current" : ""}`}
              />
            )}
          </button>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
