import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Reserved paths that should not be treated as usernames
const RESERVED_PATHS = new Set([
  // Auth routes
  "login",
  "register",
  "password",
  "forgot-password",
  "reset-password",
  // Public routes
  "blog",
  "pricing",
  "about",
  "contact",
  // Dashboard routes
  "dashboard",
  "student",
  "teacher",
  "admin",
  "onboarding",
  // System routes
  "api",
  "_next",
  "favicon.ico",
  "sitemap.xml",
  "robots.txt",
  // Static assets
  "images",
  "fonts",
  "icons",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Get the first path segment
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0]?.toLowerCase();

  // If first segment is a reserved path, let it pass through
  if (!firstSegment || RESERVED_PATHS.has(firstSegment)) {
    return NextResponse.next();
  }

  // At this point, we have a potential username path
  // Let the Next.js catch-all route handle it
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
