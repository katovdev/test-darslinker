import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
  // Teacher-specific fields
  username?: string;
  businessName?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  progress?: number;
}

export interface TenantInfo {
  teacherId: string;
  username: string;
  businessName: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
}

interface AppState {
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;
  refreshToken: string | null;

  // Tenant state (for teacher subdomains)
  tenant: TenantInfo | null;
  isTeacherSubdomain: boolean;

  // UI state
  loading: boolean;
  error: string | null;

  // Data
  courses: Course[];

  // Auth actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  setAuth: (data: {
    user: User;
    authToken: string;
    refreshToken?: string;
  }) => void;
  logout: () => void;

  // Tenant actions
  setTenant: (tenant: TenantInfo | null) => void;
  setIsTeacherSubdomain: (isTeacherSubdomain: boolean) => void;

  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Data actions
  setCourses: (courses: Course[]) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      authToken: null,
      refreshToken: null,
      tenant: null,
      isTeacherSubdomain: false,
      loading: false,
      error: null,
      courses: [],

      // Auth actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setAuthToken: (authToken) =>
        set({
          authToken,
          isAuthenticated: !!authToken,
        }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),

      setAuth: ({ user, authToken, refreshToken }) =>
        set({
          user,
          authToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          authToken: null,
          refreshToken: null,
          courses: [],
        }),

      // Tenant actions
      setTenant: (tenant) => set({ tenant }),
      setIsTeacherSubdomain: (isTeacherSubdomain) => set({ isTeacherSubdomain }),

      // UI actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Data actions
      setCourses: (courses) => set({ courses }),
    }),
    {
      name: "darslinker-storage",
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated);
export const useAuthToken = () => useAppStore((state) => state.authToken);
export const useRefreshToken = () => useAppStore((state) => state.refreshToken);
export const useTenant = () => useAppStore((state) => state.tenant);
export const useIsTeacherSubdomain = () =>
  useAppStore((state) => state.isTeacherSubdomain);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);
export const useCourses = () => useAppStore((state) => state.courses);
