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
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-destructive/10 rounded-md p-3">
            <AlertTriangle className="text-destructive h-8 w-8" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-semibold">Xatolik yuz berdi</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-sm">
          Kechirasiz, kutilmagan xatolik yuz berdi. Iltimos, qaytadan urinib
          ko&apos;ring yoki bosh sahifaga qayting.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Qaytadan urinish
          </Button>

          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Bosh sahifa
            </Link>
          </Button>
        </div>

        {error.digest && (
          <p className="text-muted-foreground mt-8 text-xs">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
