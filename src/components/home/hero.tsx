"use client";

import Link from "next/link";
import { ArrowRight, Play, Users, BookOpen, Award } from "lucide-react";
import { useTranslations } from "@/hooks/use-locale";

export function Hero() {
  const t = useTranslations();

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-blue-500/20 to-transparent blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/50 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm text-gray-300">
                {t("home.heroBadge") || "Platform for modern education"}
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t("home.heroTitle")}
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-400 lg:text-xl">
              {t("home.heroSubtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
              >
                {t("home.getStarted")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800/50 px-8 py-4 font-semibold text-white transition-all hover:border-gray-600 hover:bg-gray-800"
              >
                <Play className="h-5 w-5" />
                {t("home.viewPricing")}
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-gray-800 pt-8">
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-2xl font-bold text-white">500+</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("home.statStudents") || "Students"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <BookOpen className="h-5 w-5 text-green-400" />
                  <span className="text-2xl font-bold text-white">50+</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("home.statCourses") || "Courses"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 lg:justify-start">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-2xl font-bold text-white">100+</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {t("home.statCertificates") || "Certificates"}
                </p>
              </div>
            </div>
          </div>

          {/* Right content - Visual element */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 p-6 shadow-2xl">
                {/* Course preview mockup */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500" />
                  <div>
                    <div className="h-3 w-32 rounded bg-gray-700" />
                    <div className="mt-2 h-2 w-24 rounded bg-gray-800" />
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-3">
                  {[85, 60, 40].map((progress, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Lesson {i + 1}</span>
                        <span className="text-gray-500">{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom stats */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-800 pt-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">12</p>
                    <p className="text-xs text-gray-500">Videos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">4.8</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-white">2h</p>
                    <p className="text-xs text-gray-500">Duration</p>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-1/4 -left-4 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <svg
                      className="h-4 w-4 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300">Completed!</span>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 rounded-xl border border-gray-700 bg-gray-800 p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20">
                    <Award className="h-4 w-4 text-yellow-400" />
                  </div>
                  <span className="text-sm text-gray-300">New Badge!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
