"use client";

import { BookOpen, Users, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "@/hooks/use-locale";

interface StatsData {
  activeCourses: number;
  totalStudents: number;
  totalRevenue: number;
  averageRating: number;
}

interface StatsCardsProps {
  stats?: StatsData;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const t = useTranslations();

  const statItems = [
    {
      icon: BookOpen,
      labelKey: "activeCourses",
      value: stats?.activeCourses ?? 0,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      labelKey: "totalStudents",
      value: stats?.totalStudents ?? 0,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: DollarSign,
      labelKey: "totalRevenue",
      value: stats?.totalRevenue
        ? `${stats.totalRevenue.toLocaleString()} so'm`
        : "0 so'm",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      icon: Star,
      labelKey: "averageRating",
      value: stats?.averageRating?.toFixed(1) ?? "0.0",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-gray-800 bg-gray-800/30">
            <CardContent className="p-6">
              <div className="h-16 animate-pulse rounded bg-gray-700" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card
          key={stat.labelKey}
          className="border-gray-800 bg-gray-800/30 transition-colors hover:bg-gray-800/50"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`rounded-xl ${stat.bgColor} p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-400">
                  {t(`stats.${stat.labelKey}`)}
                </p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
