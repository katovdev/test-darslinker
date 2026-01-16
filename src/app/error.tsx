"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Xatolik yuz berdi</h1>
        <p className="mb-8 max-w-md text-gray-400">
          Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib
          ko&apos;ring yoki bosh sahifaga qayting.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            className="gap-2 bg-[#7EA2D4] text-white hover:bg-[#5A85C7]"
          >
            <RefreshCw className="h-4 w-4" />
            Qaytadan urinish
          </Button>

          <Link href="/">
            <Button variant="outline" className="gap-2 border-gray-700">
              <Home className="h-4 w-4" />
              Bosh sahifa
            </Button>
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-600">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
