import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type User } from "@/context/auth-context";
import { authApi } from "@/lib/api/auth";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export interface Session {
  user: User;
  accessToken: string;
}

export interface UseSessionOptions {
  required?: boolean;
  redirectTo?: string;
  allowedRoles?: User["role"][];
}

export interface UseSessionReturn {
  data: Session | null;
  status: SessionStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSession(options: UseSessionOptions = {}): UseSessionReturn {
  const { required = false, redirectTo = "/login", allowedRoles } = options;

  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    hasHydrated,
    accessToken,
    logout: contextLogout,
    refreshUser,
  } = useAuth();

  const status: SessionStatus =
    !hasHydrated || isLoading
      ? "loading"
      : isAuthenticated
        ? "authenticated"
        : "unauthenticated";

  const session: Session | null =
    isAuthenticated && user && accessToken ? { user, accessToken } : null;

  useEffect(() => {
    if (!hasHydrated || isLoading) return;

    if (required && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/dashboard");
    }
  }, [
    hasHydrated,
    isLoading,
    required,
    isAuthenticated,
    allowedRoles,
    user,
    router,
    redirectTo,
  ]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      contextLogout();
      router.push("/login");
    }
  }, [contextLogout, router]);

  const refresh = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  return {
    data: session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user,
    logout,
    refresh,
  };
}

export function useRequireAuth(redirectTo = "/login") {
  return useSession({ required: true, redirectTo });
}

export function useRequireRole(
  roles: User["role"][],
  redirectTo = "/dashboard"
) {
  return useSession({ required: true, allowedRoles: roles, redirectTo });
}

export function useRequireAdmin() {
  return useRequireRole(["admin"]);
}

export function useRequireModerator() {
  return useRequireRole(["admin", "moderator"]);
}

export function useRequireTeacher() {
  return useRequireRole(["admin", "teacher"]);
}
