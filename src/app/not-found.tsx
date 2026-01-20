import Link from "next/link";
import { Home, Search, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 px-4">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="text-center">
        <div className="mb-6">
          <span className="text-8xl font-bold text-gray-800">404</span>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-blue-500/10 p-4">
            <Search className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-white">Sahifa topilmadi</h1>
        <p className="mb-8 max-w-md text-gray-400">
          Siz qidirayotgan sahifa mavjud emas yoki ko&apos;chirilgan
          bo&apos;lishi mumkin.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7EA2D4] px-6 py-3 font-medium text-white transition-colors hover:bg-[#5A85C7]"
          >
            <Home className="h-4 w-4" />
            Bosh sahifa
          </Link>

          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-colors hover:border-gray-600 hover:bg-gray-700"
          >
            <BookOpen className="h-4 w-4" />
            Maqolalar
          </Link>
        </div>
      </div>
    </div>
  );
}
