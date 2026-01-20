import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-muted-foreground/20 text-7xl font-semibold">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="bg-secondary rounded-md p-3">
            <Search className="text-muted-foreground h-8 w-8" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-semibold">Sahifa topilmadi</h1>
        <p className="text-muted-foreground mb-8 max-w-md text-sm">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan
          bo&apos;lishi mumkin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Bosh sahifa
            </Link>
          </Button>

          <Button variant="outline" asChild>
            <Link href="/blog">
              <BookOpen className="mr-2 h-4 w-4" />
              Maqolalar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
