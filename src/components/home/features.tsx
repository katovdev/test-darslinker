"use client";

import { useTranslations } from "@/hooks/use-locale";
import {
  BookOpen,
  Users,
  Award,
  FileQuestion,
  MessageCircle,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    titleKey: "featureCourses",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Users,
    titleKey: "featureStudents",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Award,
    titleKey: "featureCertificates",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  {
    icon: FileQuestion,
    titleKey: "featureQuiz",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: MessageCircle,
    titleKey: "featureChat",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Shield,
    titleKey: "featureSecurity",
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
  },
];

export function Features() {
  const t = useTranslations();

  return (
    <section className="bg-gray-900 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            {t("home.featuresTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-400">
            {t("home.featuresSubtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="group relative rounded-2xl border border-gray-800 bg-gray-800/30 p-8 transition-all hover:border-gray-700 hover:bg-gray-800/50"
            >
              <div
                className={`mb-6 inline-flex rounded-xl ${feature.bgColor} p-4`}
              >
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
              </div>

              <h3 className="text-xl font-semibold text-white">
                {t(`home.${feature.titleKey}`)}
              </h3>

              <p className="mt-3 text-gray-400">
                {t(`home.${feature.titleKey}Desc`)}
              </p>

              {/* Decorative corner */}
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full border border-gray-700 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
