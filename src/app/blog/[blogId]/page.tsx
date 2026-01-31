"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

const VIEW_TRACKING_DELAY = 10000; // 10 seconds before counting a view

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

  // View tracking state
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const viewEligibleRef = useRef(false);
  const currentBlogIdRef = useRef<string | null>(null);

  const trackViewIfEligible = useCallback(() => {
    if (viewEligibleRef.current && currentBlogIdRef.current) {
      blogService.trackView(currentBlogIdRef.current);
      viewEligibleRef.current = false;
    }
  }, []);

  const startViewTimer = useCallback((blogId: string) => {
    // Clear any existing timer
    if (viewTimerRef.current) {
      clearTimeout(viewTimerRef.current);
    }

    currentBlogIdRef.current = blogId;
    viewEligibleRef.current = false;

    // Start new timer - view counts after 10 seconds
    viewTimerRef.current = setTimeout(() => {
      viewEligibleRef.current = true;
    }, VIEW_TRACKING_DELAY);
  }, []);

  // Setup view tracking on page unload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackViewIfEligible();
      }
    };

    const handleBeforeUnload = () => {
      if (viewEligibleRef.current && currentBlogIdRef.current) {
        // Use sendBeacon for reliable tracking on page unload
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL || "https://api.darslinker.uz/api"}/blogs/${currentBlogIdRef.current}/view`,
          JSON.stringify({})
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
      }
      // Track view when component unmounts (navigation)
      trackViewIfEligible();
    };
  }, [trackViewIfEligible]);

  useEffect(() => {
    async function loadBlog() {
      if (!blogSlug) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await blogService.getBlogBySlug(blogSlug);

        if (response.success && response.data) {
          setBlog(response.data);
          // Start view tracking timer when blog loads
          startViewTimer(response.data.id);
        } else {
          setError("not_found");
        }
      } catch (err) {
        console.error("Failed to load blog:", err);
        setError("load_error");
      } finally {
        setIsLoading(false);
      }
    }

    loadBlog();
  }, [blogSlug, startViewTimer]);

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
      } catch {}
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
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-5 w-20 rounded-full bg-muted" />
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="flex gap-4">
              <div className="h-5 w-24 rounded bg-muted" />
              <div className="h-5 w-24 rounded bg-muted" />
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 w-full rounded bg-muted/50" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error === "not_found"
        ? t("blog.notFound") || "Blog not found"
        : t("blog.loadError") || "Failed to load blog";

    return (
      <div className="min-h-screen bg-background">
        <HomeHeader />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <FileText className="h-8 w-8 text-red-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.refresh()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                <RefreshCw className="h-4 w-4" />
                {t("blog.retry")}
              </button>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#7ea2d4] to-[#5b8ac4] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#7ea2d4]/25"
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
    <div className="min-h-screen bg-background">
      <HomeHeader />

      {/* Article Header */}
      <header className="relative border-b border-border px-4 py-12 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#7ea2d4]/10 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("blog.backToBlogs")}
          </Link>

          {/* Category badge */}
          {blog.category && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#7ea2d4]/10 px-3 py-1 text-sm font-medium text-[#7ea2d4]">
              <Tag className="h-3.5 w-3.5" />
              {blog.category}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
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
            <p className="mb-8 text-xl leading-relaxed text-muted-foreground">
              {blog.description}
            </p>
          )}

          {/* Content */}
          {blog.content ? (
            <div
              className="prose prose-lg dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-[#7ea2d4] prose-strong:text-foreground prose-code:text-[#7ea2d4] max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          ) : (
            <p className="text-muted-foreground">{t("blog.noContent")}</p>
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
                : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-red-400"
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
