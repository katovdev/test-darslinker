"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Trophy,
  Award,
  Download,
  Share2,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle,
  Calendar,
  Clock,
} from "lucide-react";
import Confetti from "react-confetti";
import { toast } from "sonner";

interface CourseSuccessPageProps {
  courseId: string;
}

export function CourseSuccessPage({ courseId }: CourseSuccessPageProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    // Stop confetti after 5 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 5000);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(confettiTimer);
    };
  }, []);

  const handleDownloadCertificate = () => {
    // TODO: Implement certificate download
    toast.info("Sertifikat yuklab olish tez orada qo'shiladi");
  };

  const handleShare = async () => {
    const shareData = {
      title: `Kursni tamomladim!`,
      text: `Men hozirgina Darslinker platformasida kursni muvaffaqiyatli tamomladim! 🎉`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Muvaffaqiyatli ulashildi!");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Havola nusxalandi!");
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-emerald-950/20 to-gray-950 p-6">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="mx-auto max-w-4xl space-y-8 py-12">
        {/* Main Success Card */}
        <Card className="border-emerald-500/30 bg-gradient-to-br from-gray-800 to-gray-900 p-8 text-center shadow-2xl shadow-emerald-500/10">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                <Trophy className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-center gap-2 text-emerald-400">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wider uppercase">
              Tabriklaymiz!
            </span>
            <Sparkles className="h-5 w-5" />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-white">
            Kursni muvaffaqiyatli tamomladingiz!
          </h1>

          <p className="mb-8 text-lg text-gray-400">
            Siz kursning barcha darslarini muvaffaqiyatli tamomladingiz!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={handleDownloadCertificate}
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Download className="mr-2 h-5 w-5" />
              Sertifikatni yuklab olish
            </Button>

            <Button
              onClick={handleShare}
              size="lg"
              variant="outline"
              className="border-gray-600 bg-gray-800 text-white hover:bg-gray-700"
            >
              <Share2 className="mr-2 h-5 w-5" />
              Ulashish
            </Button>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-gray-700 bg-gray-800 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-sm text-gray-400">Tamomlangan</p>
          </Card>

          <Card className="border-gray-700 bg-gray-800 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
                <CheckCircle className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">100%</p>
            <p className="text-sm text-gray-400">Tamomlanish</p>
          </Card>

          <Card className="border-gray-700 bg-gray-800 p-6 text-center">
            <div className="mb-3 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <Award className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">1</p>
            <p className="text-sm text-gray-400">Sertifikat</p>
          </Card>
        </div>

        {/* Certificate Preview */}
        <Card className="border-gray-700 bg-gray-800 p-8">
          <h3 className="mb-6 text-center text-2xl font-bold text-white">
            Sizning sertifikatingiz
          </h3>

          <div className="relative overflow-hidden rounded-lg border-4 border-emerald-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 shadow-xl">
            {/* Certificate Design */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent)]" />

            <div className="relative text-center">
              <div className="mb-6 flex justify-center">
                <Award className="h-16 w-16 text-emerald-500" />
              </div>

              <p className="mb-2 text-sm tracking-wider text-emerald-400 uppercase">
                Tamomlash sertifikati
              </p>

              <h2 className="mb-6 text-3xl font-bold text-white">
                Kurs sertifikati
              </h2>

              <div className="mx-auto mb-6 h-px w-32 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />

              <p className="mb-2 text-gray-400">Bu sertifikat beriladi</p>
              <p className="mb-6 text-2xl font-semibold text-white">
                [Sizning ismingiz]
              </p>

              <p className="mb-4 text-sm text-gray-400">
                Kursni muvaffaqiyatli tamomlaganligi uchun
              </p>

              <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                <div>
                  <p className="mb-1 text-xs uppercase">Sana</p>
                  <p className="font-semibold text-gray-300">
                    {new Date().toLocaleDateString("uz-UZ")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-500">
            Sertifikat PDFni yuklab oling va portfolio yoki LinkedIn
            profilingizga qo&apos;shing
          </p>
        </Card>

        {/* Next Steps */}
        <Card className="border-gray-700 bg-gray-800 p-8">
          <h3 className="mb-6 text-xl font-bold text-white">
            Keyingi qadamlar
          </h3>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/me/courses")}
              variant="outline"
              className="w-full justify-between border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
            >
              <span>Mening kurslarimga qaytish</span>
              <ArrowRight className="h-5 w-5" />
            </Button>

            <Button
              onClick={() => router.push("/courses")}
              variant="outline"
              className="w-full justify-between border-gray-700 bg-gray-900 text-white hover:bg-gray-700"
            >
              <span>Boshqa kurslarni ko&apos;rish</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
