import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "student" | "teacher" | "admin";
  avatar?: string;
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
  // Auth state
  user: User | null;
  isAuthenticated: boolean;
  authToken: string | null;

  // UI state
  loading: boolean;
  error: string | null;

  // Data
  courses: Course[];

  // Auth actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string | null) => void;
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
      user: null,
      isAuthenticated: false,
      authToken: null,
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

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          authToken: null,
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
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
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
export const useLoading = () => useAppStore((state) => state.loading);
export const useError = () => useAppStore((state) => state.error);
export const useCourses = () => useAppStore((state) => state.courses);
