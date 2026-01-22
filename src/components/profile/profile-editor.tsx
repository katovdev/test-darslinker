"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User, MapPin, Globe, Briefcase, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { teacherApi } from "@/lib/api/teacher";

interface UserProfile {
  bio?: string;
  city?: string;
  country?: string;
  specialization?: string;
}

interface ProfileEditorProps {
  user: UserProfile;
  onSaveSuccess?: (updatedUser: Partial<UserProfile>) => void;
}

export function ProfileEditor({ user, onSaveSuccess }: ProfileEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    bio: user.bio || "",
    city: user.city || "",
    country: user.country || "",
    specialization: user.specialization || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = "Bio 500 ta belgidan oshmasligi kerak";
    }

    if (formData.specialization && formData.specialization.length > 100) {
      newErrors.specialization =
        "Mutaxassislik 100 ta belgidan oshmasligi kerak";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await teacherApi.updateProfile(formData);
      toast.success("Profil yangilandi!");
      onSaveSuccess?.(formData);
    } catch (error) {
      toast.error("Profilni yangilashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = () => {
    return (
      formData.bio !== (user.bio || "") ||
      formData.city !== (user.city || "") ||
      formData.country !== (user.country || "") ||
      formData.specialization !== (user.specialization || "")
    );
  };

  return (
    <Card className="border-gray-700 bg-gray-800 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <User className="h-4 w-4 text-emerald-500" />
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
            placeholder="O'zingiz haqingizda qisqacha ma'lumot bering..."
            rows={5}
            maxLength={500}
            className={`w-full resize-none rounded-lg border bg-gray-900 px-4 py-3 text-white placeholder-gray-500 focus:ring-1 focus:outline-none ${
              errors.bio
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
          />
          <div className="flex justify-between text-xs">
            {errors.bio && <span className="text-red-500">{errors.bio}</span>}
            <span className="ml-auto text-gray-500">
              {formData.bio.length}/500
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Bu ma&apos;lumot sizning ochiq profilingizda ko&apos;rinadi
          </p>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            <Briefcase className="h-4 w-4 text-emerald-500" />
            Mutaxassislik
          </label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                specialization: e.target.value,
              }))
            }
            placeholder="Masalan: Web Development, Data Science, Marketing..."
            maxLength={100}
            className={`w-full rounded-lg border bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:ring-1 focus:outline-none ${
              errors.specialization
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
            }`}
          />
          {errors.specialization && (
            <p className="text-sm text-red-500">{errors.specialization}</p>
          )}
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <MapPin className="h-4 w-4 text-emerald-500" />
              Shahar
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, city: e.target.value }))
              }
              placeholder="Toshkent"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <Globe className="h-4 w-4 text-emerald-500" />
              Mamlakat
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, country: e.target.value }))
              }
              placeholder="O'zbekiston"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end border-t border-gray-700 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting || !hasChanges()}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Saqlash
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
