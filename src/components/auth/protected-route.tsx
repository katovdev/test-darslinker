"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useIsAuthenticated } from "@/store";
import { Loader2 } from "lucide-react";

type UserRole = "student" | "teacher" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
  unauthorizedRedirect?: string;
}

/**
 * Protected Route Wrapper
 * Checks authentication and role-based access
 *
 * @param children - Content to render if authorized
 * @param allowedRoles - Array of roles that can access this route
 * @param redirectTo - Where to redirect if not authenticated (default: /login)
 * @param unauthorizedRedirect - Where to redirect if wrong role (default: /)
 */
export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login",
  unauthorizedRedirect = "/",
}: ProtectedRouteProps) {
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for auth state to be hydrated from storage
    const checkAuth = () => {
      if (!isAuthenticated) {
        // Not authenticated - redirect to login
        router.push(redirectTo);
        return;
      }

      if (!user) {
        // Authenticated but no user data - wait for it
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        // Wrong role - redirect to unauthorized page
        router.push(unauthorizedRedirect);
        return;
      }

      // All checks passed
      setIsChecking(false);
    };

    // Small delay to allow hydration
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [
    user,
    isAuthenticated,
    allowedRoles,
    router,
    redirectTo,
    unauthorizedRedirect,
  ]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
            <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  // Render children if authorized
  return <>{children}</>;
}

/**
 * Student Route - only students can access
 */
export function StudentRoute({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute allowedRoles={["student"]} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Teacher Route - only teachers can access
 */
export function TeacherRoute({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute
      allowedRoles={["teacher"]}
      redirectTo={redirectTo}
      unauthorizedRedirect="/student/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Admin Route - only admins can access
 */
export function AdminRoute({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute
      allowedRoles={["admin"]}
      redirectTo={redirectTo}
      unauthorizedRedirect="/"
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Teacher or Admin Route - teachers and admins can access
 */
export function TeacherOrAdminRoute({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute
      allowedRoles={["teacher", "admin"]}
      redirectTo={redirectTo}
      unauthorizedRedirect="/student/dashboard"
    >
      {children}
    </ProtectedRoute>
  );
}

/**
 * Authenticated Route - any authenticated user can access
 */
export function AuthenticatedRoute({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: string;
}) {
  return (
    <ProtectedRoute
      allowedRoles={["student", "teacher", "admin"]}
      redirectTo={redirectTo}
    >
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;
