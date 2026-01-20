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

interface AppState {
  // Hydration state
  _hasHydrated: boolean;

  // Auth state - tokens stored in sessionStorage per TODO.md
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

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
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;

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
      accessToken: null,
      refreshToken: null,
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

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setAccessToken: (accessToken) => set({ accessToken }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          courses: [],
        }),

      // UI actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Data actions
      setCourses: (courses) => set({ courses }),
    }),
    {
      name: "darslinker-storage",
      // Use sessionStorage per TODO.md for security
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // Persist user info and tokens in sessionStorage
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
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
export const useAccessToken = () => useAppStore((state) => state.accessToken);
export const useRefreshToken = () => useAppStore((state) => state.refreshToken);
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);
export const useCourses = () => useAppStore((state) => state.courses);
