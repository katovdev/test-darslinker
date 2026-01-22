"use client";

import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

interface UserAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
}

export function UserAvatar({ src, alt, fallback, className }: UserAvatarProps) {
  const getInitials = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Avatar className={className}>
      {src && <AvatarImage src={src} alt={alt || "Avatar"} />}
      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 font-semibold text-white">
        {getInitials(fallback || alt)}
      </AvatarFallback>
    </Avatar>
  );
}
