"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { teacherApi } from "@/lib/api/teacher";

interface AvatarUploaderProps {
  currentAvatar?: string;
  userName?: string;
  onUploadSuccess?: (avatarUrl: string) => void;
}

export function AvatarUploader({
  currentAvatar,
  userName,
  onUploadSuccess,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Faqat JPG, PNG yoki WebP formatdagi rasmlar qabul qilinadi");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    await uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const { data } = await teacherApi.uploadAvatar(file);

      if (data.avatarUrl) {
        toast.success("Avatar yangilandi!");
        onUploadSuccess?.(data.avatarUrl);
      }
    } catch (error) {
      toast.error("Avatar yuklashda xatolik yuz berdi");
      console.error(error);
      // Revert preview on error
      setPreview(currentAvatar);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm("Avatarni o'chirishni xohlaysizmi?")) {
      return;
    }

    setUploading(true);
    try {
      await teacherApi.deleteAvatar();
      setPreview(undefined);
      toast.success("Avatar o'chirildi");
      onUploadSuccess?.("");
    } catch (error) {
      toast.error("Avatar o'chirishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <UserAvatar
          src={preview}
          alt={userName}
          fallback={userName}
          className="h-32 w-32 border-4 border-gray-700"
        />

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}

        {preview && !uploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute top-0 right-0 rounded-full bg-red-500 p-1 text-white shadow-lg transition-transform hover:scale-110"
            title="Avatarni o'chirish"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
        >
          <Camera className="mr-2 h-4 w-4" />
          {preview ? "Avatarni o'zgartirish" : "Avatar yuklash"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-center text-xs text-gray-500">
        JPG, PNG yoki WebP • Max 5MB
      </p>
    </div>
  );
}
