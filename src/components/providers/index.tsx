"use client";

import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      {children}
      <ToastProvider />
    </ThemeProvider>
  );
}

export { ThemeProvider } from "./theme-provider";
export { ToastProvider } from "./toast-provider";
