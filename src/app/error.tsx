"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-red-500/10 to-transparent blur-3xl" />
      </div>

      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/10 p-4">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-white">
          Xatolik yuz berdi
        </h1>
        <p className="mb-8 max-w-md text-gray-400">
          Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib
          ko&apos;ring yoki bosh sahifaga qayting.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7EA2D4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#5A85C7]"
          >
            <RefreshCw className="h-4 w-4" />
            Qaytadan urinish
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
          >
            <Home className="h-4 w-4" />
            Bosh sahifa
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-600">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
