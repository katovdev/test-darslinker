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
  FileText,
  Loader2,
  Trash2,
  Upload,
  X,
  File,
  Image as ImageIcon,
  Archive,
} from "lucide-react";
import { toast } from "sonner";
import { courseContentService } from "@/services/course-content";
import type { FileLesson, CreateFileLessonDto } from "@/types/file-lesson";

interface FileEditorProps {
  moduleId: string;
  fileLesson?: FileLesson | null;
  onSave: (fileLesson: FileLesson) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const FILE_TYPE_ICONS = {
  pdf: FileText,
  docx: FileText,
  image: ImageIcon,
  video: File,
  archive: Archive,
};

const FILE_TYPE_COLORS = {
  pdf: "text-red-500",
  docx: "text-blue-500",
  image: "text-green-500",
  video: "text-purple-500",
  archive: "text-yellow-500",
};

export function FileEditor({
  moduleId,
  fileLesson,
  onSave,
  onCancel,
  onDelete,
}: FileEditorProps) {
  const isEditing = !!fileLesson;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: fileLesson?.title || "",
    description: fileLesson?.description || "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<string>(
    fileLesson?.file?.fileCategoryType || "pdf"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Fayl nomini kiriting";
    } else if (formData.title.length < 2) {
      newErrors.title = "Fayl nomi kamida 2 ta belgidan iborat bo'lishi kerak";
    }

    if (!isEditing && !file) {
      newErrors.file = "Faylni yuklang";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("lessonId", moduleId);
      formDataObj.append("title", formData.title);
      formDataObj.append("description", formData.description || "");

      if (file) {
        formDataObj.append("file", file);
      }

      let result: FileLesson;

      // TODO: Implement file lesson API
      if (isEditing && fileLesson) {
        toast.info("Fayl tahrirlash tez orada qo'shiladi");
        return;
      } else {
        toast.info("Fayl yuklash tez orada qo'shiladi");
        return;
      }

      toast.success(isEditing ? "Fayl yangilandi" : "Fayl yuklandi");
      onSave(result);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!fileLesson || !onDelete) return;
    if (
      !confirm(
        "Bu faylni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement file lesson API
      toast.info("Fayl o'chirish tez orada qo'shiladi");
      toast.success("Fayl o'chirildi");
      onDelete();
    } catch (error) {
      toast.error("O'chirishda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 100MB)
    if (selectedFile.size > 100 * 1024 * 1024) {
      toast.error("Fayl hajmi 100MB dan oshmasligi kerak");
      return;
    }

    // Auto-detect file type
    const extension = selectedFile.name.split(".").pop()?.toLowerCase();
    let detectedType = "pdf";

    if (extension === "pdf") {
      detectedType = "pdf";
    } else if (["doc", "docx"].includes(extension || "")) {
      detectedType = "docx";
    } else if (
      ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")
    ) {
      detectedType = "image";
    } else if (["zip", "rar", "7z"].includes(extension || "")) {
      detectedType = "archive";
    } else if (["mp4", "webm", "mov"].includes(extension || "")) {
      detectedType = "video";
    }

    setFileType(detectedType);
    setFile(selectedFile);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    const Icon =
      FILE_TYPE_ICONS[type as keyof typeof FILE_TYPE_ICONS] || FileText;
    const colorClass =
      FILE_TYPE_COLORS[type as keyof typeof FILE_TYPE_COLORS] ||
      "text-gray-500";
    return <Icon className={`h-6 w-6 ${colorClass}`} />;
  };

  const getAcceptedTypes = () => {
    switch (fileType) {
      case "pdf":
        return ".pdf";
      case "docx":
        return ".doc,.docx";
      case "image":
        return ".jpg,.jpeg,.png,.gif,.webp";
      case "archive":
        return ".zip,.rar,.7z";
      case "video":
        return ".mp4,.webm,.mov";
      default:
        return "*";
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-gray-700 bg-gray-900 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="h-5 w-5 text-emerald-500" />
            {isEditing ? "Faylni tahrirlash" : "Yangi fayl yuklash"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isEditing
              ? "Fayl ma'lumotlarini tahrirlang"
              : "Talabalar uchun fayl resursini yuklang"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Fayl nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Masalan: 1-modul uchun qo'shimcha materiallar"
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

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Tavsif</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Fayl haqida qisqacha ma'lumot..."
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* File Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Fayl turi</label>
            <div className="grid grid-cols-5 gap-2">
              {(["pdf", "docx", "image", "archive", "video"] as const).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFileType(type)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors ${
                      fileType === type
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                    }`}
                  >
                    {getFileIcon(type)}
                    <span className="text-xs text-white uppercase">{type}</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Fayl {!isEditing && <span className="text-red-500">*</span>}
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-700 p-6 text-center transition-colors hover:border-emerald-500/50 hover:bg-gray-800/30"
            >
              <Upload className="mx-auto h-8 w-8 text-gray-500" />
              <p className="mt-2 text-sm text-white">
                {file ? file.name : "Fayl yuklash uchun bosing"}
              </p>
              <p className="text-xs text-gray-500">
                {file
                  ? formatFileSize(file.size)
                  : `${fileType.toUpperCase()} formati (max 100MB)`}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileChange}
              className="hidden"
            />

            {errors.file && (
              <p className="text-sm text-red-500">{errors.file}</p>
            )}

            {file && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-700 bg-gray-800 p-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(fileType)}
                  <div>
                    <p className="text-white">{file.name}</p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
                  Yuklanmoqda...
                </>
              ) : isEditing ? (
                "Saqlash"
              ) : (
                "Yuklash"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
