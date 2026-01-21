"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  PlayCircle,
  Loader2,
  Trash2,
  Upload,
  X,
  Video,
  Link as LinkIcon,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { courseContentService } from "@/services/course-content";
import type {
  Lesson,
  CreateLessonInput,
  UpdateLessonInput,
} from "@/lib/api/course-content";

interface LessonEditorProps {
  moduleId: string;
  lesson?: Lesson | null;
  onSave: (lesson: Lesson) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

type VideoInputMode = "url" | "upload";

export function LessonEditor({
  moduleId,
  lesson,
  onSave,
  onCancel,
  onDelete,
}: LessonEditorProps) {
  const isEditing = !!lesson;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CreateLessonInput>({
    title: lesson?.title || "",
    content: lesson?.content || "",
    videoUrl: lesson?.videoUrl || "",
    durationMins: lesson?.durationMins || 0,
    order: lesson?.order,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Dars nomini kiriting";
    } else if (formData.title.length < 2) {
      newErrors.title = "Dars nomi kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (formData.durationMins && formData.durationMins < 0) {
      newErrors.durationMins = "Davomiylik manfiy bo'lishi mumkin emas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      let result: Lesson | null;

      if (isEditing && lesson) {
        const updateInput: UpdateLessonInput = {
          title: formData.title,
          content: formData.content || null,
          videoUrl: formData.videoUrl || null,
          durationMins: formData.durationMins || 0,
        };
        result = await courseContentService.updateLesson(
          lesson.id,
          updateInput
        );
      } else {
        result = await courseContentService.createLesson(moduleId, formData);
      }

      if (result) {
        onSave(result);
      }
    } catch {
      // Error handling is done in the service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson || !onDelete) return;
    if (
      !confirm(
        "Bu darsni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const success = await courseContentService.deleteLesson(lesson.id);
      if (success) {
        onDelete();
      }
    } catch {
      // Error handling is done in the service
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Faqat MP4, WebM yoki MOV formatdagi videolar qabul qilinadi"
      );
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast.error("Video hajmi 500MB dan oshmasligi kerak");
      return;
    }

    // For now, we'll show a message that direct upload needs backend support
    // In a real implementation, you would upload to a service like S3
    toast.info(
      "Video yuklash funksiyasi hozircha mavjud emas. URL orqali video qo'shing."
    );

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const isVimeoUrl = (url: string) => {
    return url.includes("vimeo.com");
  };

  const getVideoPreview = () => {
    if (!formData.videoUrl) return null;

    if (isYouTubeUrl(formData.videoUrl)) {
      // Extract video ID from YouTube URL
      const match = formData.videoUrl.match(
        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
      );
      if (match) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${match[1]}`}
            className="aspect-video w-full rounded-lg"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    if (isVimeoUrl(formData.videoUrl)) {
      const match = formData.videoUrl.match(/vimeo\.com\/(\d+)/);
      if (match) {
        return (
          <iframe
            src={`https://player.vimeo.com/video/${match[1]}`}
            className="aspect-video w-full rounded-lg"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }
    }

    // Direct video URL
    return (
      <video
        src={formData.videoUrl}
        controls
        className="aspect-video w-full rounded-lg"
      />
    );
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-700 bg-gray-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <PlayCircle className="h-5 w-5 text-emerald-500" />
            {isEditing ? "Darsni tahrirlash" : "Yangi dars"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Dars ma'lumotlarini tahrirlang"
              : "Yangi dars yarating"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Dars nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masalan: Kirish va tanishuv"
              className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Video</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVideoInputMode("url")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                  videoInputMode === "url"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <LinkIcon className="h-4 w-4" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setVideoInputMode("upload")}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                  videoInputMode === "upload"
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                <Upload className="h-4 w-4" />
                Yuklash
              </button>
            </div>

            {videoInputMode === "url" ? (
              <div className="space-y-2">
                <input
                  type="url"
                  value={formData.videoUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoUrl: e.target.value,
                    }))
                  }
                  placeholder="https://youtube.com/watch?v=... yoki https://vimeo.com/..."
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500">
                  YouTube, Vimeo yoki to&apos;g&apos;ridan-to&apos;g&apos;ri
                  video URL kiritishingiz mumkin
                </p>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-6 text-center transition-colors hover:border-emerald-500/50 hover:bg-gray-800/30"
              >
                <Video className="mx-auto h-8 w-8 text-gray-500" />
                <p className="mt-2 text-sm text-gray-400">
                  Video yuklash uchun bosing
                </p>
                <p className="text-xs text-gray-500">
                  MP4, WebM, MOV (max 500MB)
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoUpload}
              className="hidden"
            />

            {formData.videoUrl && (
              <div className="relative mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, videoUrl: "" }))
                  }
                  className="absolute top-2 right-2 z-10 rounded-full bg-gray-900/80 p-1 text-white hover:bg-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
                {getVideoPreview()}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Dars mazmuni
            </label>
            <textarea
              value={formData.content || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Dars haqida ma'lumot, qo'shimcha materiallar, linklar va h.k."
              rows={6}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <Clock className="h-4 w-4" />
              Davomiylik (daqiqa)
            </label>
            <input
              type="number"
              value={formData.durationMins || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  durationMins: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="15"
              min={0}
              className={`w-full rounded-lg border bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:ring-1 focus:outline-none ${
                errors.durationMins
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
              }`}
            />
            {errors.durationMins && (
              <p className="text-sm text-red-500">{errors.durationMins}</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div>
            {isEditing && onDelete && (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                O&apos;chirish
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isDeleting}
              className="border-gray-700 bg-gray-800 text-white hover:bg-gray-700"
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isDeleting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saqlanmoqda...
                </>
              ) : isEditing ? (
                "Saqlash"
              ) : (
                "Yaratish"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
