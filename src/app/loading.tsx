import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-xl" />
          <Loader2 className="relative mx-auto h-10 w-10 animate-spin text-blue-500" />
        </div>
        <p className="mt-4 text-sm text-gray-400">Yuklanmoqda...</p>
      </div>
    </div>
  );
}
