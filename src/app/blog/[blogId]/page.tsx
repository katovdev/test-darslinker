"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Eye,
  Calendar,
  Share2,
  Loader2,
  RefreshCw,
  BookOpen,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "@/hooks/use-locale";
import { blogAPI, type Blog, type BlogSection } from "@/lib/api/blog";
import { blogService, type TransformedBlog } from "@/services/blog";
import { toast } from "sonner";

const VIEW_TRACKING_DELAY = 10000; // 10 seconds

export default function BlogDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const blogId = params.blogId as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<TransformedBlog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // View tracking refs
  const viewTracked = useRef(false);
  const startTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if view was already tracked in this session
  const isViewTrackedInSession = useCallback(() => {
    if (typeof window === "undefined") return false;
    const trackedViews = sessionStorage.getItem("tracked_blog_views");
    if (trackedViews) {
      const views = JSON.parse(trackedViews) as string[];
      return views.includes(blogId);
    }
    return false;
  }, [blogId]);

  // Mark view as tracked in session
  const markViewAsTracked = useCallback(() => {
    if (typeof window === "undefined") return;
    const trackedViews = sessionStorage.getItem("tracked_blog_views");
    const views = trackedViews ? (JSON.parse(trackedViews) as string[]) : [];
    if (!views.includes(blogId)) {
      views.push(blogId);
      sessionStorage.setItem("tracked_blog_views", JSON.stringify(views));
    }
  }, [blogId]);

  // Track the view
  const trackView = useCallback(async () => {
    if (viewTracked.current || isViewTrackedInSession()) return;

    viewTracked.current = true;
    markViewAsTracked();

    try {
      await blogAPI.trackBlogView(blogId);
    } catch {
      // Silently fail - view tracking shouldn't disrupt UX
    }
  }, [blogId, isViewTrackedInSession, markViewAsTracked]);

  // Set up view tracking with 10 second delay
  useEffect(() => {
    if (!blogId || isViewTrackedInSession()) return;

    startTime.current = Date.now();

    // Set timer to track view after 10 seconds
    timerRef.current = setTimeout(() => {
      trackView();
    }, VIEW_TRACKING_DELAY);

    // Track view when leaving if enough time has passed
    const handleBeforeUnload = () => {
      if (Date.now() - startTime.current >= VIEW_TRACKING_DELAY) {
        trackView();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Track view on unmount if enough time passed
      if (Date.now() - startTime.current >= VIEW_TRACKING_DELAY) {
        trackView();
      }
    };
  }, [blogId, trackView, isViewTrackedInSession]);

  // Load blog data
  useEffect(() => {
    async function loadBlog() {
      if (!blogId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await blogAPI.getBlogById(blogId);

        if (response.success && response.data) {
          setBlog(response.data);

          // Load related blogs
          try {
            const relatedResponse = await blogService.getRelatedBlogs(
              response.data.id || response.data._id || blogId,
              3
            );
            if (relatedResponse.success && relatedResponse.data) {
              const transformed: TransformedBlog[] = relatedResponse.data.map(
                (b) => ({
                  id: b.id || b._id || "",
                  title: b.title,
                  description: b.subtitle || "",
                  views: b.multiViews || 0,
                  date: new Date(b.createdAt).toLocaleDateString("uz-UZ"),
                  category: b.categoryId?.name || null,
                  slug: b.slug || b.id || b._id || "",
                  tags: b.tags || [],
                  isArchived: b.isArchive || false,
                })
              );
              setRelatedBlogs(transformed);
            }
          } catch {
            // Related blogs are optional, don't fail the whole page
          }
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
  }, [blogId, t]);

  // Handle share
  const handleShare = async () => {
    const url = window.location.href;
    const title = blog?.title || "Blog";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback to clipboard
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

  // Render blog sections
  const renderSections = (sections: BlogSection[]) => {
    return sections.map((section, index) => {
      const content = section.content || "";
      const type = section.type || "paragraph";

      // Render based on type
      switch (type) {
        case "h1":
          return (
            <h1 key={index} className="mt-8 mb-4 text-3xl font-bold text-white">
              {content}
            </h1>
          );
        case "h2":
          return (
            <h2 key={index} className="mt-6 mb-3 text-2xl font-bold text-white">
              {content}
            </h2>
          );
        case "h3":
          return (
            <h3
              key={index}
              className="mt-4 mb-2 text-xl font-semibold text-white"
            >
              {content}
            </h3>
          );
        case "h4":
          return (
            <h4
              key={index}
              className="mt-3 mb-2 text-lg font-semibold text-white"
            >
              {content}
            </h4>
          );
        case "code":
          return (
            <pre
              key={index}
              className="my-4 overflow-x-auto rounded-lg bg-gray-800 p-4 text-sm text-gray-300"
            >
              <code>{content}</code>
            </pre>
          );
        case "quote":
          return (
            <blockquote
              key={index}
              className="my-4 border-l-4 border-[#7EA2D4] pl-4 text-gray-400 italic"
            >
              {content}
            </blockquote>
          );
        default:
          // Paragraph - split by newlines
          return content.split("\n").map((paragraph, pIndex) =>
            paragraph.trim() ? (
              <p
                key={`${index}-${pIndex}`}
                className="mb-4 leading-relaxed text-gray-300"
              >
                {paragraph}
              </p>
            ) : null
          );
      }
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
            <Skeleton className="h-8 w-32 bg-gray-700" />
            <Skeleton className="h-8 w-8 rounded-full bg-gray-700" />
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-4 h-10 w-3/4 bg-gray-700" />
          <div className="mb-8 flex gap-4">
            <Skeleton className="h-5 w-24 bg-gray-700" />
            <Skeleton className="h-5 w-24 bg-gray-700" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full bg-gray-700" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-4xl items-center px-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("blog.backToBlogs")}
              </Link>
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-16">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <BookOpen className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {t("blog.errorTitle")}
              </h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.refresh()}
                variant="outline"
                className="gap-2 border-gray-700 text-white hover:bg-gray-800"
              >
                <RefreshCw className="h-4 w-4" />
                {t("blog.retry")}
              </Button>
              <Button
                asChild
                className="bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
              >
                <Link href="/blog">{t("blog.backToBlogs")}</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("blog.backToBlogs")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="text-gray-400 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(blog.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {(blog.multiViews || 0).toLocaleString()} {t("blog.views")}
          </span>
          {blog.categoryId && (
            <Badge variant="secondary">{blog.categoryId.name}</Badge>
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-gray-700 text-gray-400"
              >
                {tag.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Subtitle */}
        {blog.subtitle && (
          <p className="mb-8 text-lg text-gray-400">{blog.subtitle}</p>
        )}

        {/* Content */}
        <article className="prose prose-invert max-w-none">
          {blog.sections && blog.sections.length > 0 ? (
            renderSections(blog.sections)
          ) : (
            <p className="text-gray-400">{t("blog.noContent")}</p>
          )}
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="mt-16 border-t border-gray-800 pt-8">
            <h2 className="mb-6 text-2xl font-bold text-white">
              {t("blog.relatedArticles")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug || related.id}`}
                  className="group"
                >
                  <Card className="h-full border-gray-800 bg-gray-800/30 transition-colors hover:bg-gray-800/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-base text-white group-hover:text-[#7EA2D4]">
                        {related.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 line-clamp-2 text-sm text-gray-400">
                        {related.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {related.views}
                        </span>
                        <span>{related.date}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
