import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "student" | "teacher" | "admin";
  status?: "pending" | "active" | "blocked";
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
  // Hydration state
  _hasHydrated: boolean;

  // Auth state (tokens are in httpOnly cookies, not stored in JS)
  user: User | null;
  isAuthenticated: boolean;

  // Tenant state (for teacher subdomains)
  tenant: TenantInfo | null;
  isTeacherSubdomain: boolean;

  // UI state
  loading: boolean;
  error: string | null;

  // Data
  courses: Course[];

  // Hydration action
  setHasHydrated: (hasHydrated: boolean) => void;

  // Auth actions
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
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
      _hasHydrated: false,
      user: null,
      isAuthenticated: false,
      tenant: null,
      isTeacherSubdomain: false,
      loading: false,
      error: null,
      courses: [],

      // Hydration action
      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

      // Auth actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          courses: [],
        }),

      // Tenant actions
      setTenant: (tenant) => set({ tenant }),
      setIsTeacherSubdomain: (isTeacherSubdomain) =>
        set({ isTeacherSubdomain }),

      // UI actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Data actions
      setCourses: (courses) => set({ courses }),
    }),
    {
      name: "darslinker-storage",
      // Use localStorage for user info (survives tab close)
      // Actual auth is via httpOnly cookies which browser manages
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user info, NOT tokens (they're in httpOnly cookies)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector hooks for better performance
export const useHasHydrated = () => useAppStore((state) => state._hasHydrated);
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated);
export const useTenant = () => useAppStore((state) => state.tenant);
export const useIsTeacherSubdomain = () =>
  useAppStore((state) => state.isTeacherSubdomain);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);
export const useCourses = () => useAppStore((state) => state.courses);
