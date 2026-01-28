"use client";

import {
  BookOpen,
  Users,
  Award,
  MessageSquare,
  Shield,
  ClipboardCheck,
  Play,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

const features = [
  {
    key: "featureCourses",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    key: "featureStudents",
    icon: Users,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
    iconColor: "text-green-400",
  },
  {
    key: "featureCertificates",
    icon: Award,
    color: "from-yellow-500 to-yellow-600",
    bgColor: "bg-yellow-500/10",
    iconColor: "text-yellow-400",
  },
  {
    key: "featureQuiz",
    icon: ClipboardCheck,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-400",
  },
  {
    key: "featureChat",
    icon: MessageSquare,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-500/10",
    iconColor: "text-pink-400",
  },
  {
    key: "featureSecurity",
    icon: Shield,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
  },
  {
    key: "featureVideo",
    icon: Play,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    iconColor: "text-red-400",
  },
  {
    key: "featureProgress",
    icon: TrendingUp,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-400",
  },
  {
    key: "featureAssignments",
    icon: FileText,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-500/10",
    iconColor: "text-indigo-400",
  },
];

export function Features() {
  const t = useTranslations();

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div
          id="features"
          className="rounded-[40px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20"
          style={{ backgroundColor: "#232324" }}
        >
          <div className="mx-auto max-w-6xl">
            {/* Section header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {t("home.featuresTitle")}
              </h2>
            </div>

            {/* Features grid */}
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.key}
                  className="group relative rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/20 hover:shadow-lg"
                >
                  {/* Icon */}
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {t(`home.${feature.key}`)}
                  </h3>
                  <p className="leading-relaxed text-white/80">
                    {t(`home.${feature.key}Desc`)}
                  </p>

                  {/* Number indicator */}
                  <div className="absolute top-6 right-6 text-4xl font-bold text-white/20">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
