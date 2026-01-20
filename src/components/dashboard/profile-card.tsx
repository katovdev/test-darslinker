"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/context/auth-context";

interface ProfileCardProps {
  rating?: number;
  specialization?: string;
  location?: string;
}

export function ProfileCard({
  rating = 0,
  specialization,
  location,
}: ProfileCardProps) {
  const user = useUser();

  const getInitials = () => {
    const first = user?.firstName?.charAt(0).toUpperCase() || "";
    const last = user?.lastName?.charAt(0).toUpperCase() || "";
    return first + last || "?";
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      case "admin":
        return "Admin";
      default:
        return "";
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-800/30">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
          <Avatar className="h-24 w-24 bg-gradient-to-br from-[#7EA2D4] to-[#5A85C7]">
            <AvatarFallback className="bg-transparent text-3xl font-bold text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="mt-4 sm:mt-0 sm:ml-6">
            <h2 className="text-2xl font-bold text-white">
              {user?.firstName} {user?.lastName}
            </h2>

            <p className="mt-1 text-gray-400">{getRoleLabel()}</p>

            {specialization && (
              <p className="mt-2 text-sm text-gray-300">{specialization}</p>
            )}

            {location && <p className="text-sm text-gray-400">{location}</p>}

            {rating > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-600"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">
                  {rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
