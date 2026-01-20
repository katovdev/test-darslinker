"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  getRefreshToken,
  setTokens as setCookieTokens,
  setAccessToken as setCookieAccessToken,
  clearTokens,
  hasValidToken,
} from "@/lib/cookies";
import { authApi } from "@/lib/api/auth";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "student" | "teacher" | "moderator" | "admin";
  status?: "pending" | "active" | "blocked";
  avatar?: string;
  username?: string;
  businessName?: string;
  // Student-only fields
  teacherId?: string;
  points?: number;
  level?: number;
  // Teacher-only fields
  logoUrl?: string;
  primaryColor?: string;
  specialization?: string;
  telegramUsername?: string;
  balance?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
}

interface AuthContextValue extends AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    hasHydrated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();

      if (token) {
        try {
          const response = await authApi.me();
          if (response.success && response.data) {
            setState({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              hasHydrated: true,
            });
            return;
          }
        } catch {
          clearTokens();
        }
      }

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasHydrated: true,
      });
    };

    initAuth();
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }));
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string) => {
    setCookieTokens(accessToken, refreshToken);
  }, []);

  const setAccessToken = useCallback((accessToken: string) => {
    setCookieAccessToken(accessToken);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: true,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!hasValidToken()) {
      logout();
      return;
    }

    try {
      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data);
      } else {
        logout();
      }
    } catch {
      logout();
    }
  }, [logout, setUser]);

  const value: AuthContextValue = {
    ...state,
    accessToken: typeof window !== "undefined" ? getAccessToken() : null,
    refreshToken: typeof window !== "undefined" ? getRefreshToken() : null,
    setUser,
    setTokens,
    setAccessToken,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const useUser = () => useAuth().user;
export const useIsAuthenticated = () => useAuth().isAuthenticated;
export const useHasHydrated = () => useAuth().hasHydrated;
