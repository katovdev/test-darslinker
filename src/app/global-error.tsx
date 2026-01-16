"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="uz">
      <body className="bg-gray-900 text-white">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <h1 className="mb-2 text-3xl font-bold">Jiddiy xatolik</h1>
            <p className="mb-8 max-w-md text-gray-400">
              Dasturda jiddiy xatolik yuz berdi. Iltimos, sahifani yangilang.
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-[#7EA2D4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#5A85C7]"
            >
              <RefreshCw className="h-4 w-4" />
              Sahifani yangilash
            </button>

            {error.digest && (
              <p className="mt-8 text-xs text-gray-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
