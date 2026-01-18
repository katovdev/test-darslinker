"use client";

import {
  BookOpen,
  Users,
  Award,
  MessageSquare,
  Shield,
  ClipboardCheck,
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
];

export function Features() {
  const t = useTranslations();

  return (
    <section className="relative px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-800" />

      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
            {t("home.featuresLabel") || "Features"}
          </span>
          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            {t("home.featuresTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {t("home.featuresSubtitle")}
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.key}
              className="group relative rounded-2xl border border-gray-800 bg-gray-800/30 p-6 transition-all duration-300 hover:border-gray-700 hover:bg-gray-800/50"
            >
              {/* Gradient hover effect */}
              <div className={`absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-10`} />

              {/* Icon */}
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgColor}`}>
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-white">
                {t(`home.${feature.key}`)}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {t(`home.${feature.key}Desc`)}
              </p>

              {/* Number indicator */}
              <div className="absolute right-6 top-6 text-4xl font-bold text-gray-800/50">
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
