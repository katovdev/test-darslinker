"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Calendar,
  Share2,
  Loader2,
  RefreshCw,
  FileText,
  Check,
  Tag,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";
import { blogAPI, type Blog, type BlogSection } from "@/lib/api/blog";
import { blogService, type TransformedBlog } from "@/services/blog";
import { toast } from "sonner";
import { HomeHeader, HomeFooter } from "@/components/home";

const VIEW_TRACKING_DELAY = 10000;

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

  const viewTracked = useRef(false);
  const startTime = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isViewTrackedInSession = useCallback(() => {
    if (typeof window === "undefined") return false;
    const trackedViews = sessionStorage.getItem("tracked_blog_views");
    if (trackedViews) {
      const views = JSON.parse(trackedViews) as string[];
      return views.includes(blogId);
    }
    return false;
  }, [blogId]);

  const markViewAsTracked = useCallback(() => {
    if (typeof window === "undefined") return;
    const trackedViews = sessionStorage.getItem("tracked_blog_views");
    const views = trackedViews ? (JSON.parse(trackedViews) as string[]) : [];
    if (!views.includes(blogId)) {
      views.push(blogId);
      sessionStorage.setItem("tracked_blog_views", JSON.stringify(views));
    }
  }, [blogId]);

  const trackView = useCallback(async () => {
    if (viewTracked.current || isViewTrackedInSession()) return;

    viewTracked.current = true;
    markViewAsTracked();

    try {
      await blogAPI.trackBlogView(blogId);
    } catch {
      // Silently fail
    }
  }, [blogId, isViewTrackedInSession, markViewAsTracked]);

  useEffect(() => {
    if (!blogId || isViewTrackedInSession()) return;

    startTime.current = Date.now();

    timerRef.current = setTimeout(() => {
      trackView();
    }, VIEW_TRACKING_DELAY);

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

      if (Date.now() - startTime.current >= VIEW_TRACKING_DELAY) {
        trackView();
      }
    };
  }, [blogId, trackView, isViewTrackedInSession]);

  useEffect(() => {
    async function loadBlog() {
      if (!blogId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await blogAPI.getBlogById(blogId);

        if (response.success && response.data) {
          setBlog(response.data);

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
            // Related blogs are optional
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

  const handleShare = async () => {
    const url = window.location.href;
    const title = blog?.title || "Blog";

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
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

  const renderSections = (sections: BlogSection[]) => {
    return sections.map((section, index) => {
      const content = section.content || "";
      const type = section.type || "paragraph";

      switch (type) {
        case "h1":
          return (
            <h1 key={index} className="mt-10 mb-4 text-3xl font-bold text-white">
              {content}
            </h1>
          );
        case "h2":
          return (
            <h2 key={index} className="mt-8 mb-3 text-2xl font-bold text-white">
              {content}
            </h2>
          );
        case "h3":
          return (
            <h3 key={index} className="mt-6 mb-2 text-xl font-semibold text-white">
              {content}
            </h3>
          );
        case "h4":
          return (
            <h4 key={index} className="mt-4 mb-2 text-lg font-semibold text-white">
              {content}
            </h4>
          );
        case "code":
          return (
            <pre
              key={index}
              className="my-6 overflow-x-auto rounded-xl border border-gray-700 bg-gray-800/50 p-4 text-sm text-gray-300"
            >
              <code>{content}</code>
            </pre>
          );
        case "quote":
          return (
            <blockquote
              key={index}
              className="my-6 border-l-4 border-blue-500 bg-blue-500/5 py-4 pl-6 pr-4 text-gray-300 italic"
            >
              {content}
            </blockquote>
          );
        default:
          return content.split("\n").map((paragraph, pIndex) =>
            paragraph.trim() ? (
              <p
                key={`${index}-${pIndex}`}
                className="mb-4 text-lg leading-relaxed text-gray-300"
              >
                {paragraph}
              </p>
            ) : null
          );
      }
    });
  };

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

  // Error state
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
          <div className="absolute left-1/2 top-0 h-[300px] w-[500px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl" />
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
          {blog.categoryId && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
              <Tag className="h-3.5 w-3.5" />
              {blog.categoryId.name}
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
              {formatDate(blog.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {(blog.multiViews || 0).toLocaleString()} {t("blog.views")}
            </span>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              {copied ? t("blog.linkCopied") : "Share"}
            </button>
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-1 text-xs text-gray-400"
                >
                  {tag.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Article Content */}
      <main className="px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl">
          {/* Subtitle */}
          {blog.subtitle && (
            <p className="mb-8 text-xl leading-relaxed text-gray-400">
              {blog.subtitle}
            </p>
          )}

          {/* Content */}
          {blog.sections && blog.sections.length > 0 ? (
            renderSections(blog.sections)
          ) : (
            <p className="text-gray-400">{t("blog.noContent")}</p>
          )}
        </article>

        {/* Related Blogs */}
        {relatedBlogs.length > 0 && (
          <section className="mx-auto mt-20 max-w-3xl border-t border-gray-800 pt-12">
            <h2 className="mb-8 text-2xl font-bold text-white">
              {t("blog.relatedArticles")}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedBlogs.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug || related.id}`}
                  className="group"
                >
                  <article className="h-full rounded-2xl border border-gray-700 bg-gray-800/30 p-5 transition-all duration-300 hover:border-gray-600 hover:bg-gray-800/50">
                    <h3 className="font-semibold text-white transition-colors group-hover:text-blue-400 line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-400 line-clamp-2">
                      {related.description}
                    </p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {related.views}
                      </span>
                      <span>{related.date}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <HomeFooter />
    </div>
  );
}
