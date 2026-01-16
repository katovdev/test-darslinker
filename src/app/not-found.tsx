import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4 text-white">
      <div className="text-center">
        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-8xl font-bold text-[#7EA2D4] opacity-30">
            404
          </span>
        </div>

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-[#7EA2D4]/20 p-4">
            <Search className="h-12 w-12 text-[#7EA2D4]" />
          </div>
        </div>

        <h1 className="mb-2 text-3xl font-bold">Sahifa topilmadi</h1>
        <p className="mb-8 max-w-md text-gray-400">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi
          mumkin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="gap-2 bg-[#7EA2D4] text-white hover:bg-[#5A85C7]">
              <Home className="h-4 w-4" />
              Bosh sahifa
            </Button>
          </Link>

          <Link href="/blog">
            <Button variant="outline" className="gap-2 border-gray-700">
              <BookOpen className="h-4 w-4" />
              Maqolalar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
