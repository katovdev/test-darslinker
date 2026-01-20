"use client";

import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";
import { AuthProvider } from "@/context/auth-context";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </ThemeProvider>
  );
}

export { ThemeProvider } from "./theme-provider";
export { ToastProvider } from "./toast-provider";
export { AuthProvider } from "@/context/auth-context";
